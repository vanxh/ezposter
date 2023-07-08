/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type z from "zod";
import Speakeasy from "speakeasy";

import { GAMEFLIP_API_BASE_URL } from "@/constants";
import {
  type AuthProps,
  type KeyValuePair,
  type JsonPatch,
  throwIfError,
  GameflipProfileSchema,
  GameflipListingSchema,
  type createListingQuery,
} from "@/utils/gfapi";

export default class GFApi {
  private gameflipApiKey: string;
  private gameflipApiSecret: string;
  private gameflipId?: string;

  constructor({ gameflipApiKey, gameflipApiSecret, gameflipId }: AuthProps) {
    this.gameflipApiKey = gameflipApiKey;
    this.gameflipApiSecret = gameflipApiSecret;
    this.gameflipId = gameflipId;
  }

  private get _authHeader() {
    return `GFAPI ${this.gameflipApiKey}:${Speakeasy.totp({
      encoding: "base32",
      algorithm: "sha1",
      digits: 6,
      secret: this.gameflipApiSecret,
    })}`;
  }

  private async _fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(
      `${GAMEFLIP_API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`,
      {
        ...options,
        headers: {
          ...options.headers,
          Authorization: this._authHeader,
        },
      }
    );

    const data = await res.json();

    throwIfError(data as unknown as { error?: { message?: string } });

    return data as T;
  }

  private async _get<T>(url: string, options: RequestInit = {}): Promise<T> {
    return this._fetch<T>(url, { ...options, method: "GET" });
  }

  private async _post<T>(url: string, options: RequestInit = {}): Promise<T> {
    return this._fetch<T>(url, { ...options, method: "POST" });
  }

  private async _delete<T>(url: string, options: RequestInit = {}): Promise<T> {
    return this._fetch<T>(url, { ...options, method: "DELETE" });
  }

  private async _patch<T>(url: string, options: RequestInit = {}): Promise<T> {
    return this._fetch<T>(url, {
      ...options,
      method: "PATCH",
      headers: {
        ...options.headers,
        "Content-Type": "application/json-patch+json",
      },
    });
  }

  private async _getPaginated<T>(
    url: string,
    options: RequestInit = {},
    prevData: T[] = []
  ): Promise<T[]> {
    const data = await this._get<{
      next_page: string | null;
      data: T[];
    }>(url, options);
    const newData = [...prevData, ...data.data];

    if (data.next_page) {
      return this._getPaginated(
        data.next_page.split("?")[1] || "",
        options,
        newData
      );
    }

    return newData;
  }

  public async getMe() {
    const data = await this._get<unknown>("/account/me/profile");
    return GameflipProfileSchema.parse(data);
  }

  public async getListing(id: string) {
    const data = await this._get<{
      data: unknown;
    }>(`/listing/${id}`);

    return GameflipListingSchema.parse(data.data);
  }

  public async searchListings(
    search: KeyValuePair<string> | string
  ): Promise<z.infer<typeof GameflipListingSchema>[]> {
    let query;
    if (typeof search === "string") {
      query = search;
    } else {
      query = new URLSearchParams();
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(search)) {
        query.append(key, value);
      }
    }

    const data = await this._getPaginated<
      z.infer<typeof GameflipListingSchema>
    >(`/listing?${query.toString()}`);

    return data;
  }

  public async editListing(id: string, patch: JsonPatch[]) {
    const data = await this._patch<unknown>(`/listing/${id}`, {
      body: JSON.stringify(patch),
    });

    return data;
  }

  public async deleteListing(id: string) {
    await this.editListing(id, [
      {
        op: "replace",
        path: "/status",
        value: "draft",
      },
    ]);
    await this._delete<unknown>(`/listing/${id}`);
  }

  public async postListing(
    listing: ReturnType<typeof createListingQuery>,
    images: string[]
  ): Promise<string> {
    const {
      data: { id },
    } = await this._post<{ data: { id: string } }>("/listing", {
      body: JSON.stringify(listing),
    });

    let idx = 1;
    for await (const image of images) {
      const {
        data: { id: photoId, upload_url: uploadUrl },
      } = await this._post<{
        data: { id: string; upload_url: string };
      }>(`/listing/${id}/photo`, {});

      const fetchImgRes = await fetch(image);
      const imgBuffer = await fetchImgRes.arrayBuffer();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "image/png",
        },
        body: imgBuffer,
      });

      if (!uploadRes.ok) {
        throw new Error(
          `Failed to upload image: ${uploadRes.status} ${uploadRes.statusText}`
        );
      }

      const patch = [
        {
          op: "replace",
          path: `/photo/${photoId}/status`,
          value: "active",
        },
        {
          op: "replace",
          path: `/photo/${photoId}/display_order`,
          value: idx,
        },
      ];
      if (idx === 1) {
        patch.push({
          op: "replace",
          path: "/cover_photo",
          value: photoId,
        });
      }
      if (idx === images.length) {
        patch.push({
          op: "replace",
          path: "/status",
          value: "onsale",
        });
      }

      await this.editListing(id, patch);

      idx += 1;
    }

    return id;
  }
}

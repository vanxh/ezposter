import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default function OGImage() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return new ImageResponse(
    (
      <div tw="flex flex-col justify-center items-center text-center bg-white gap-y-6 w-full h-full">
        <h1 tw="text-9xl font-extrabold">EZ Poster</h1>
        <p tw="text-5xl font-medium">Auto post your gameflip listings</p>
      </div>
    ),
    {
      width: 1200,
      height: 600,
    }
  );
}

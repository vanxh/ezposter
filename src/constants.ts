import { PremiumTier } from "@prisma/client";

export const GAMEFLIP_CATEGORIES = {
  "Video Games": "CONSOLE_VIDEO_GAMES",
  "In-Game Items": "DIGITAL_INGAME",
  "Gift Cards": "GIFTCARD",
  "Video Game Hardware": "VIDEO_GAME_HARDWARE",
  "Video Game Accessories": "VIDEO_GAME_ACCESSORIES",
  "Toys & Games": "TOYS_AND_GAMES",
  "Video & DVD": "VIDEO_DVD",
  Unknown: "UNKNOWN",
};

export const GAMEFLIP_PLATFORMS = {
  XBOX: "xbox",
  X360: "xbox_360",
  XONE: "xbox_one",
  // PS1: "playstation",
  // PS2: "playstation_2",
  // PS3: "playstation_3",
  PS4: "playstation_4",
  PS5: "playstation_5",
  // PSP: "playstation_portable",
  // PSVITA: "playstation_vita",
  N64: "nintendo_64",
  NGAMECUBE: "nintendo_gamecube",
  NWII: "nintendo_wii",
  NWIIU: "nintendo_wiiu",
  NSWITCH: "nintendo_switch",
  NDS: "nintendo_ds",
  NDSI: "nintendo_dsi",
  N3DS: "nintendo_3ds",
  STEAM: "steam",
  // ORIGIN: "origin",
  // UPLAY: "uplay",
  // GOG: "gog",
  MOBILE: "mobile",
  // BATTLENET: "battlenet",
  XLIVE: "xbox_live",
  PSN: "playstation_network",
  UNKNOWN: "unknown", // For PC platform, use UNKNOWN
};

export const GAMEFLIP_UPCS = {
  CSGO: "094922417596",
  FORTNITE: "GFFORTNITE",
  FALLOUT76_PC: "GFPCFLLOUT76",
  FALLOUT76_PS4: "GFPSFLLOUT76",
  FALLOUT76_XONE: "GFXOFLLOUT76",
  POKEMON_SWORD_SHIELD: "045496596972",
  POKEMON_LETS_GO: "045496593940",
  POKEMON_SUN_MOON: "GFPOKSUNMOON",
  GTA5_PC: "710425414534",
  GTA5_PS4: "710425474521",
  GTA5_XONE: "710425494512",
  RL_ALL: "023171037943,812872018928,812872018935,GF00RLSWITCH",
  RL_STEAM: "023171037943",
  RL_PS4: "812872018928",
  RL_XONE: "812872018935",
  RL_SWITCH: "GF00RLSWITCH",
  ROBLOX: "GF0000ROBLOX",
  ELDEN_RING_PC: "GF000ERINGPC",
  ELDEN_RING_PS4: "GF000ERINGPS",
  ELDEN_RING_XONE: "GF000ERINGXS",
  POKEMON_LEGENDS_ARCEUS: "045496598044",
  PUBG: "000000578080",
};

export const MAX_LISTINGS_PER_USER = {
  [PremiumTier.BASIC]: 50,
  [PremiumTier.PREMIUM]: 500,
};

import {createEnv} from "@t3-oss/env-nextjs";
import {z} from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        NODE_ENV: z.enum(["development", "test", "production"]),
        CLERK_SECRET_KEY: z.string(),
        UPLOADTHING_SECRET: z.string(),
        UPLOADTHING_APP_ID: z.string(),
        QUIRREL_BASE_URL: z.string(),
        QUIRREL_API_URL: z.string().url(),
        QUIRREL_ENCRYPTION_SECRET: z.string(),
        QUIRREL_TOKEN: z.string(),
        SELLIX_WEBHOOK_SECRET: z.string(),
    },

    client: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string(),
        NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string(),
        NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string(),
    },

    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
        NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
        process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
        NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
        process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
        UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
        UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
        QUIRREL_BASE_URL: process.env.QUIRREL_BASE_URL,
        QUIRREL_API_URL: process.env.QUIRREL_API_URL,
        QUIRREL_ENCRYPTION_SECRET: process.env.QUIRREL_ENCRYPTION_SECRET,
        QUIRREL_TOKEN: process.env.QUIRREL_TOKEN,
        SELLIX_WEBHOOK_SECRET: process.env.SELLIX_WEBHOOK_SECRET,
    },

    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

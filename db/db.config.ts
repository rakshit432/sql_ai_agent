import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL is not set in the environment");
}

if (!TURSO_AUTH_TOKEN) {
  throw new Error("TURSO_AUTH_TOKEN is not set in the environment");
}

export const db = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});
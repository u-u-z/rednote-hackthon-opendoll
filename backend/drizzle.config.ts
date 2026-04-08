import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./mod/dbmod/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/opendoll.db",
  },
});

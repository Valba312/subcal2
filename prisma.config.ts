import "dotenv/config";

import { defineConfig } from "prisma/config";

// Use environment DATABASE_URL when available, otherwise fall back to a file-based DB
const DATABASE_URL = process.env.DATABASE_URL || "file:/data/prisma/dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
  },
});

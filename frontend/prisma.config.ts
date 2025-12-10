import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // This URL is used for migrations and introspection
    url: process.env.DATABASE_URL!,
  },
});
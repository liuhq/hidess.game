import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "#": path.resolve(__dirname, "server/src"),
      "@hidess/shared": path.resolve(__dirname, "shared/src/index.ts"),
    },
  },
})

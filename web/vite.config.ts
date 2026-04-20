import { devtools } from "@tanstack/devtools-vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

import { lingui } from "@lingui/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import viteReact from "@vitejs/plugin-react-swc"

const config = defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:5876",
      "/ws": {
        target: "ws://localhost:5876",
        ws: true,
        rewrite: (p) => p.replace(/^\/ws/, "/api/room"),
      },
    },
  },
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    lingui(),
  ],
})

export default config

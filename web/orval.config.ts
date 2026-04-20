import { defineConfig } from "orval"

const OPENAPI_URL = process.env.OPENAPI_URL
  ?? "http://localhost:5876/openapi.json"

export default defineConfig({
  openapi: {
    input: {
      target: OPENAPI_URL,
    },
    output: {
      mode: "tags-split",
      target: "src/api/swr.gen.ts",
      schemas: "src/api/model",
      client: "swr",
      mock: true,
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
})

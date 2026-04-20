import {defineConfig} from '@lingui/cli'

export default defineConfig({
  compileNamespace: "ts",
  sourceLocale: "en",
  locales: ["zh", "en"],
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}",
      include: ["<rootDir>/src"]
    }
  ],
  fallbackLocales: {
    "default": "en"
  }
})
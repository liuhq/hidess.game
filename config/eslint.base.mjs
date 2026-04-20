import * as eslint from '@eslint/js'
import {defineConfig} from 'eslint/config'
import tseslint from 'typescript-eslint'

const baseConfig = defineConfig([
  eslint.configs.recommended,
  tseslint.configs.recommended
])

export default baseConfig
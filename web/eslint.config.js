//  @ts-check

import baseConfig from '../config/eslint.base.mjs'
import {defineConfig} from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'
import * as linguiConfig from 'eslint-plugin-lingui'

export default defineConfig([
  baseConfig,
  tanstackConfig,
  linguiConfig.configs["flat/recommended"],
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    ignores: ['eslint.config.js'],
  },
])

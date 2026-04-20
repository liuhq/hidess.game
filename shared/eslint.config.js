//  @ts-check

import baseConfig from '../config/eslint.base.mjs'
import {defineConfig} from 'eslint/config'

export default defineConfig([
  baseConfig,
  {
    ignores: ['eslint.config.js'],
  },
])

import { DEV_DB } from "#/constants"
import Database from "better-sqlite3"

export const db = new Database(DEV_DB)

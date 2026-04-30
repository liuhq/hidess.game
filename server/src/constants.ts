import path from "node:path"

export const DEV_PORT: number = 5876
export const DEV_DB: string = path.join(
  process.env.DEV_DB_DIR ?? ".",
  "auth_dev.sqlite",
)

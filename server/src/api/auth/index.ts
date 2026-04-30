import { Hono } from "hono"
import { auth, type AuthType } from "./ba"

const authRoute = new Hono<{
  Bindings: AuthType
}>({
  strict: false,
})

authRoute.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw)
})

export { auth, authRoute }
export type { AuthType }

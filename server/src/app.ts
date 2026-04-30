import { createNodeWebSocket } from "@hono/node-ws"
import { Hono } from "hono"
import { auth, type AuthType } from "./api/auth"

export interface HonoType {
  Variables: AuthType
}

const app = new Hono<HonoType>({
  strict: false,
})

export const {
  upgradeWebSocket,
  injectWebSocket,
} = createNodeWebSocket({ app })

/**
 * Auth Middleware
 * https://better-auth.com/docs/integrations/hono#middleware
 */
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    c.set("user", null)
    c.set("session", null)
    await next()
    return
  }

  c.set("user", session.user)
  c.set("session", session.session)
  await next()
})

export { app }

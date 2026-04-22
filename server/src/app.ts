import { createNodeWebSocket } from "@hono/node-ws"
import { Hono } from "hono"

const app = new Hono()

export const {
  upgradeWebSocket,
  injectWebSocket,
} = createNodeWebSocket({ app })

export { app }

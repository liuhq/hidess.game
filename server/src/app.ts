import { createNodeWebSocket } from "@hono/node-ws"
import { Hono } from "hono"

const app = new Hono()

const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app })

export { app, injectWebSocket, upgradeWebSocket }

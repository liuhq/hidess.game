import { createNodeWebSocket } from "@hono/node-ws"
import { swaggerUI } from "@hono/swagger-ui"
import { Hono } from "hono"
import { openAPIRouteHandler } from "hono-openapi"
import { api } from "./api"
import { DEV_PORT } from "./constants"
import { ws } from "./ws"

const app = new Hono()

// #region WebSocket
export const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({
  app,
})

app.route("/", ws)
// #endregion

// #region RESTAPI
app
  .route("/", api)
  .get(
    "/openapi.json",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: "Hidess API",
          version: "0.0.1",
          description: "Server API",
        },
        servers: [
          {
            url: `http://localhost:${DEV_PORT}`,
            description: "Development Server (Local)",
          },
        ],
      },
    }),
  )
  .get("/doc", swaggerUI({ url: "/openapi.json" }))
// #endregion

export { app }

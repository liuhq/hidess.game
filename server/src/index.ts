import { swaggerUI } from "@hono/swagger-ui"
import { openAPIRouteHandler } from "hono-openapi"
import { api } from "./api"
import { app } from "./app"
import { DEV_PORT } from "./constants"
import { runServer } from "./server"
import { ws } from "./ws"

app
  .route("/", ws)
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

runServer(app)

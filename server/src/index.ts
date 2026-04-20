import { user } from "#/user.js"
import { serve } from "@hono/node-server"
import { swaggerUI } from "@hono/swagger-ui"
import { Hono } from "hono"
import { openAPIRouteHandler } from "hono-openapi"
import { app, injectWebSocket } from "./app"
import { room } from "./room"

const DEV_PORT = 5876

const api = new Hono().basePath("/api")
api
  .route("/", user)
  .route("/", room)
  .post("/login", async (c) => {
    const data = await c.req.formData()
    const token = data.get("login")

    if (!token) {
      return c.json({ message: "Can't be empty" })
    }

    return c.json({ message: `${token}: Login Successfully` })
  })

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

const server = serve({
  fetch: app.fetch,
  port: DEV_PORT,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

injectWebSocket(server)

process.on("SIGINT", () => {
  server.close()
  process.exit(0)
})
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
})

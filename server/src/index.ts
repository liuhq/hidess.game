import { app, injectWebSocket } from "#/app"
import { serve } from "@hono/node-server"
import { DEV_PORT } from "./constants"

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

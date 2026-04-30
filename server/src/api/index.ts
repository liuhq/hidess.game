import { Hono } from "hono"
import { authRoute } from "./auth"
import { game } from "./game"
import { user } from "./user"

const api = new Hono({
  strict: false,
}).basePath("/api")

api
  .route("/", game)
  .route("/", user)
  .route("/", authRoute)

export { api }

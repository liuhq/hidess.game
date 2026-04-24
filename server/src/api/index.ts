import { Hono } from "hono"
import { game } from "./game"
import { user } from "./user"

const api = new Hono()
api
  .route("/", game)
  .route("/", user)

export { api }

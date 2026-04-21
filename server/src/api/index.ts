import { room } from "#/api/room"
import { user } from "#/api/user"
import { API_VERSION } from "#/constants"
import { Hono } from "hono"

const api = new Hono().basePath(`/api/${API_VERSION}`)
api
  .route("/", user)
  .route("/", room)

export { api }

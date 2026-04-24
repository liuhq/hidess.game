import { v, VUserId } from "#/schema"
import { type Context, Hono } from "hono"
import { describeRoute, validator } from "hono-openapi"
import { upgradeWebSocket } from "../app"
import { USER_WS } from "./store"

const ws = new Hono().basePath("/ws")

const WsQuerySchema = v.object({
  uid: VUserId,
})

type WsQueryInput = v.InferInput<typeof WsQuerySchema>
type WsQueryOutput = v.InferOutput<typeof WsQuerySchema>

ws.get(
  "/",
  describeRoute({
    description: "WebSocket connected when UID login",
    tags: ["WebSocket"],
    operationId: "webSocketByUid",
    responses: {
      101: {
        description: "Switching Protocols — WebSocket connection established",
      },
    },
  }),
  validator("query", WsQuerySchema),
  upgradeWebSocket((
    c: Context<object, "/ws", {
      in: { query: WsQueryInput }
      out: { query: WsQueryOutput }
    }>,
  ) => {
    const { uid } = c.req.valid("query")

    return {
      onOpen: (evt, ws) => {
        USER_WS.connect(uid, ws)
      },
      onClose: (evt, ws) => {
        USER_WS.disconnect(uid)
      },
      onError: (evt, ws) => {
        USER_WS.disconnect(uid)
      },
      onMessage: (evt, ws) => {
      },
    }
  }),
)

export { ws }

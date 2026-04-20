import { type Context, Hono } from "hono"
import { describeRoute, validator } from "hono-openapi"
import * as v from "valibot"
import { upgradeWebSocket } from "./app"
import { NanoId } from "./utils"

const GameSchema = v.pipe(
  v.object({
    rid: NanoId,
    gid: NanoId,
  }),
)

type GameInput = v.InferInput<typeof GameSchema>
type GameOutput = v.InferOutput<typeof GameSchema>

const game = new Hono().basePath("/game")

game.get(
  "/:gid",
  validator("param", GameSchema),
  describeRoute({
    description: "WebSocket connected by RID and GID",
    tags: ["room"],
    operationId: "webSocketByRidGid",
    responses: {
      101: {
        description: "Switching Protocols — WebSocket connection established",
      },
    },
  }),
  upgradeWebSocket((
    c: Context<{}, "/game/:id", {
      in: { param: GameInput }
      out: { param: GameOutput }
    }>,
  ) => {
    const param = c.req.valid("param")

    return {
      onMessage: (evt, ws) => {
        console.log(`Message from client: ${evt.data}`)
        ws.send(`Start ${param.gid} in ${param.rid}!`)
      },
      onClose: () => {
        console.log("Connection closed")
      },
    }
  }),
)

export { game }

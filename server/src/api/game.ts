import { ErrorResponse, NanoId } from "#/utils"
import { Action } from "@hidess/shared"
import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import * as v from "valibot"
import { UserId } from "./user"

const GameInfo = v.pipe(
  v.object({
    gid: NanoId,
    players: v.strictObject({
      Red: UserId,
      Black: UserId,
    }),
    state: v.union([v.literal("playing"), v.literal("finished")]),
    steps: v.array(Action),
  }),
)

const GameParam = v.pipe(
  v.object({
    gid: NanoId,
  }),
)

const game = new Hono().basePath("/game")

game.get(
  "/:gid",
  describeRoute({
    description: "Get game information",
    tags: ["game"],
    responses: {
      200: {
        description: "Game Information",
        content: {
          "application/json": {
            schema: resolver(GameInfo),
          },
        },
      },
      400: {
        description: "Invalid GID",
        content: { "application/json": { schema: resolver(ErrorResponse) } },
      },
    },
  }),
  validator("param", GameParam),
  (c) => {
    const param = c.req.valid("param")

    return c.json<v.InferOutput<typeof GameInfo>>({})
  },
)

export { game }

import { UserId } from "#/api/user"
import { VErrorResponse, VNanoId } from "#/utils"
import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import * as v from "valibot"
import { game } from "../game"
import { ROOM_STORE, RoomInfo } from "./store"

const Room = {
  Param: {
    request: v.pipe(
      v.object({
        rid: VNanoId,
      }),
    ),
    response: RoomInfo,
  } as const,
  Query: {
    request: v.pipe(
      v.object({
        uid: UserId,
      }),
    ),
  } as const,
} as const

const room = new Hono().basePath("/room")

room
  .route("/:rid/", game)
  .get(
    "/:rid",
    describeRoute({
      description: "Get room Information via RID",
      tags: ["room"],
      responses: {
        200: {
          description: "Room Information",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  player: {
                    type: "array",
                    uniqueItems: true,
                    items: {
                      type: "string",
                      minLength: 2,
                      pattern: "^[a-zA-Z][a-zA-Z0-9_\\-]+$",
                    },
                  },
                },
                required: ["player"],
              },
            },
          },
        },
        400: {
          description: "Invalid room RID",
          content: { "application/json": { schema: resolver(VErrorResponse) } },
        },
      },
    }),
    validator("param", Room.Param.request),
    (c) => {
      const param = c.req.valid("param")

      return c.json<v.InferOutput<typeof Room.Param.response>>({
        players: [param.rid, "alex", "bob", "hacker_1997"],
        gaming: [],
        history: [],
      })
    },
  )
  .post()

export { room }

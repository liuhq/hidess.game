import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import * as v from "valibot"
import { game } from "./game"
import { UserId } from "./user"
import { ErrorResponse, NanoId } from "./utils"

const Room = {
  GetInfo: {
    request: v.pipe(
      v.object({
        rid: NanoId,
      }),
    ),
    response: v.pipe(
      v.object({
        player: v.pipe(
          v.array(UserId),
          v.minLength(1),
        ),
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
          content: { "application/json": { schema: resolver(ErrorResponse) } },
        },
      },
    }),
    validator("param", Room.GetInfo.request),
    (c) => {
      const param = c.req.valid("param")

      return c.json<v.InferOutput<typeof Room.GetInfo.response>>({
        player: ["alex", "bob", "hacker_1997"],
      })
    },
  )

export { room }

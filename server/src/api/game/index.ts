import { db } from "#/db"
import { v, VErrorResponse } from "#/schema"
import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import { createUserStore, type createUserStore as CreateUserStore } from "../user/store"
import { VGameGet, VGamePatch, VGamePost } from "./schema"
import { createGameStore, type createGameStore as CreateGameStore } from "./store"

export function createGameRoutes(
  gameStore: ReturnType<typeof CreateGameStore>,
  userStore: ReturnType<typeof CreateUserStore>,
) {
  const game = new Hono().basePath("/game")

  game.get(
    "/:gid",
    describeRoute({
      description: "Get game information",
      tags: ["Game"],
      responses: {
        200: {
          description: "Game information",
          content: {
            "application/json": {
              schema: resolver(VGameGet.ParamByGid.Response),
            },
          },
        },
        400: {
          description: "Invalid GID",
          content: { "application/json": { schema: resolver(VErrorResponse) } },
        },
      },
    }),
    validator("param", VGameGet.ParamByGid.Param),
    (c) => {
      const { gid } = c.req.valid("param")

      const info = gameStore.get(gid)
      if (!info) {
        return c.json<VErrorResponse>(
          { status: 400, message: `Game not found: ${gid}` },
          400,
        )
      }

      return c.json<v.InferOutput<typeof VGameGet.ParamByGid.Response>>({
        data: info,
      })
    },
  )

  game.get(
    "/",
    describeRoute({
      description: "Get user's game history",
      tags: ["Game"],
      responses: {
        200: {
          description: "Historical game information",
          content: {
            "application/json": {
              schema: resolver(VGameGet.QueryByUid.Response),
            },
          },
        },
        400: {
          description: "Invalid UID",
          content: { "application/json": { schema: resolver(VErrorResponse) } },
        },
      },
    }),
    validator("query", VGameGet.QueryByUid.Query),
    (c) => {
      const { uid } = c.req.valid("query")

      const games = gameStore.getByUid(uid)

      return c.json<
        v.InferOutput<typeof VGameGet.QueryByUid.Response>
      >({
        data: games,
      })
    },
  )

  game.post(
    "/",
    describeRoute({
      description: "Create a new game",
      tags: ["Game"],
      responses: {
        200: {
          description: "New game GID",
          content: {
            "application/json": { schema: resolver(VGamePost.Response) },
          },
        },
      },
    }),
    validator("json", VGamePost.Body),
    (c) => {
      const { players } = c.req.valid("json")

      const info = gameStore.create(players)

      for (const uid of [players.Red, players.Black]) {
        if (!userStore.get(uid)) {
          userStore.create(uid)
        }
        userStore.update(uid, {
          status: "playing",
          current_gid: info.gid,
        })
      }

      return c.json<v.InferOutput<typeof VGamePost.Response>>({
        data: info.gid,
      })
    },
  )

  game.patch(
    "/:gid",
    describeRoute({
      description: "Update the gaming status",
      tags: ["Game"],
      responses: {
        204: {
          description: "Update successful",
        },
        304: {
          description: "No update required",
        },
        400: {
          description: "Update failed",
          content: {
            "application/json": { schema: resolver(VErrorResponse) },
          },
        },
      },
    }),
    validator("param", VGamePatch.ParamByGid.Param),
    validator("json", VGamePatch.ParamByGid.Body),
    (c) => {
      const { gid } = c.req.valid("param")
      const body = c.req.valid("json")

      const before = gameStore.get(gid)
      if (!before) {
        return c.json<VErrorResponse>(
          { status: 400, message: `Game not found: ${gid}` },
          400,
        )
      }

      const { info: updated, changed } = gameStore.update(gid, body)
      if (!updated) {
        return c.json<VErrorResponse>(
          { status: 400, message: `Game not found: ${gid}` },
          400,
        )
      }
      if (!changed) {
        return c.body(null, 304)
      }

      if (
        "status" in body
        && body.status === "finished"
        && before.status !== "finished"
      ) {
        const gameInfo = gameStore.get(gid)!
        for (const uid of [before.players.Red, before.players.Black]) {
          const profile = userStore.get(uid)
          const history = profile
            ? [...profile.history, gameInfo]
            : [gameInfo]
          if (!profile) {
            userStore.create(uid)
          }
          userStore.update(uid, {
            history,
            current_gid: undefined,
            status: "online",
          })
        }
      }

      return c.body(null, 204)
    },
  )

  return game
}

const gameStore = createGameStore(db)
const userStore = createUserStore(db)
const game = createGameRoutes(gameStore, userStore)

export { game }

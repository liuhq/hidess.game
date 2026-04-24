import { v, VErrorResponse } from "#/schema"
import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import { VGameGet, VGamePatch, VGamePost } from "./schema"

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
    const param = c.req.valid("param")

    return c.json<v.InferOutput<typeof VGameGet.ParamByGid.Response>>({
      data: {},
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
    const query = c.req.valid("query")

    return c.json<v.InferOutput<typeof VGameGet.QueryByUid.Response>>({
      data: [],
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
    const body = c.req.valid("json")

    return c.json<v.InferOutput<typeof VGamePost.Response>>({ data: "" })
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
        content: { "application/json": { schema: resolver(VErrorResponse) } },
      },
    },
  }),
  validator("param", VGamePatch.ParamByGid.Param),
  validator("json", VGamePatch.ParamByGid.Body),
  (c) => {
    const param = c.req.valid("param")
    const body = c.req.valid("json")

    return c.body(null, 204)
  },
)

export { game }

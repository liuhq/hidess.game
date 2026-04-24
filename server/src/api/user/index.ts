import { v, VErrorResponse } from "#/schema"
import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import { VUserDelete, VUserGet, VUserPatch, VUserPost } from "./schema"

const user = new Hono().basePath("/user")

user.get(
  "/:uid",
  describeRoute({
    description: "Get user information",
    tags: ["User"],
    responses: {
      200: {
        description: "User information",
        content: {
          "application/json": {
            schema: resolver(VUserGet.ParamByUid.Response),
          },
        },
      },
      400: {
        description: "Invalid UID",
        content: { "application/json": { schema: resolver(VErrorResponse) } },
      },
    },
  }),
  validator("param", VUserGet.ParamByUid.Param),
  (c) => {
    const param = c.req.valid("param")

    return c.json<v.InferOutput<typeof VUserGet.ParamByUid.Response>>({
      data: {},
    })
  },
)

user.post(
  "/",
  describeRoute({
    description: "Create a new user",
    tags: ["User"],
    responses: {
      204: {
        description: "Create successful",
      },
    },
  }),
  validator("json", VUserPost.Body),
  (c) => {
    const body = c.req.valid("json")

    return c.body(null, 204)
  },
)

user.patch(
  "/:uid",
  describeRoute({
    description: "Update user information	",
    tags: ["User"],
    responses: {
      200: {
        description: "Updated information",
        content: {
          "application/json": {
            schema: resolver(VUserPatch.ParamByUid.Response),
          },
        },
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
  validator("param", VUserPatch.ParamByUid.Param),
  validator("json", VUserPatch.ParamByUid.Body),
  (c) => {
    const param = c.req.valid("param")
    const body = c.req.valid("json")

    return c.json<v.InferOutput<typeof VUserPatch.ParamByUid.Response>>({
      data: {},
    })
  },
)

user.delete(
  "/:uid",
  describeRoute({
    description: "Delete user",
    tags: ["User"],
    responses: {
      204: {
        description: "Delete successful",
      },
      400: {
        description: "Delete failed",
        content: { "application/json": { schema: resolver(VErrorResponse) } },
      },
    },
  }),
  validator("param", VUserDelete.ParamByUid.Param),
  (c) => {
    const param = c.req.valid("param")

    return c.body(null, 204)
  },
)

export { user }

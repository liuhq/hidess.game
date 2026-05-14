import { db } from "#/db"
import { v, VErrorResponse, VUserId } from "#/schema"
import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import { VUserGet, VUserPatch } from "./schema"
import { createUserStore, type createUserStore as CreateUserStore } from "./store"

export function createUserRoutes(
  store: ReturnType<typeof CreateUserStore>,
) {
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
      const { uid } = c.req.valid("param")

      let info = store.get(uid)
      if (!info) {
        info = store.create(uid)
      }

      return c.json<v.InferOutput<typeof VUserGet.ParamByUid.Response>>({
        data: info,
      })
    },
  )

  user.patch(
    "/:uid",
    describeRoute({
      description: "Update user information",
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
          content: {
            "application/json": { schema: resolver(VErrorResponse) },
          },
        },
      },
    }),
    validator("param", VUserPatch.ParamByUid.Param),
    validator("json", VUserPatch.ParamByUid.Body),
    (c) => {
      const { uid } = c.req.valid("param")
      const body = c.req.valid("json")

      const { info: updated, changed } = store.update(uid, body)
      if (!updated) {
        return c.json<VErrorResponse>(
          { status: 400, message: `User not found: ${uid}` },
          400,
        )
      }
      if (!changed) {
        return c.body(null, 304)
      }

      return c.json<v.InferOutput<typeof VUserPatch.ParamByUid.Response>>({
        data: updated,
      })
    },
  )

  return user
}

const store = createUserStore(db)
const user = createUserRoutes(store)

export { user }
export { VUserId as UserId }

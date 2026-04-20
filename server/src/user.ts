import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import * as v from "valibot"

export const UserId = v.pipe(
  v.string(),
  v.minLength(2, "Must be 2 or more characters long."),
  v.regex(
    /^[a-zA-Z][a-zA-Z0-9_\-]+$/,
    "Must start with a letter and contain only letters, numbers, underscores, or hyphens (>= 2 characters).",
  ),
)

export type UserId = v.InferInput<typeof UserId>

const querySchema = v.object({
  uid: v.string(),
})

const responseSchema = v.pipe(
  v.string(),
)

const user = new Hono().basePath("/user")

user.get(
  "/:uid",
  describeRoute({
    description: "Get user Information via UID",
    tags: ["user"],
    responses: {
      200: {
        description: "User Information",
        content: {
          "text/plain": { schema: resolver(responseSchema) },
        },
      },
    },
  }),
  validator("param", querySchema),
  (c) => {
    const data = c.req.valid("param")
    return c.text(`${data.uid} access`)
  },
)

export { user }

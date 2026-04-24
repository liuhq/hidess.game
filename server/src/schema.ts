import * as v from "valibot"

export { v }

export const VUserId = v.pipe(
  v.string(),
  v.minLength(2, "Must be 2 or more characters long."),
  v.regex(
    /^[a-zA-Z][a-zA-Z0-9_-]+$/,
    "Must start with a letter and contain only letters, numbers, underscores, or hyphens (>= 2 characters).",
  ),
)

export type VUserId = v.InferInput<typeof VUserId>

export function VResponseWrap_<TItem extends v.GenericSchema>(item: TItem) {
  return v.object({
    data: item,
  })
}

export const VErrorResponse = v.pipe(
  v.object({
    status: v.number(),
    message: v.string(),
  }),
  v.metadata({ ref: "ErrorResponse" }),
)

export type VErrorResponse = v.InferInput<typeof VErrorResponse>

export const VNanoId = v.pipe(
  v.string(),
  v.length(10, "Must be 10 characters long."),
  v.nanoid(),
)

export type VNanoId = v.InferInput<typeof VNanoId>

import { nanoid } from "nanoid"
import * as v from "valibot"

export const ErrorResponse = v.pipe(
  v.object({
    status: v.number(),
    message: v.string(),
  }),
  v.metadata({ ref: "ErrorResponse" }),
)

export type ErrorResponse = v.InferInput<typeof ErrorResponse>

export const NanoId = v.pipe(
  v.string(),
  v.length(10, "Must be 10 characters long."),
  v.nanoid(),
)

export type NanoId = v.InferInput<typeof NanoId>

export const Utils = {
  generateId: (existingIds: Set<NanoId>): NanoId => {
    const size = 10
    let id = nanoid(size)
    while (existingIds.has(id)) {
      id = nanoid(size)
    }
    return id
  },
} as const

import { nanoid } from "nanoid"
import type { VNanoId } from "./schema"

export const Utils = {
  generateId: (existingIds: Set<VNanoId>): VNanoId => {
    const size = 10
    let id = nanoid(size)
    while (existingIds.has(id)) {
      id = nanoid(size)
    }
    return id
  },
} as const

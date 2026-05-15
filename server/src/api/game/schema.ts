import { v, VNanoId, VResponseWrap_, VUserId } from "#/schema"
import { Action } from "@hidess/shared"

export const VGameSide = v.strictObject({
  Red: VUserId,
  Black: VUserId,
})

export const VGameStatus = v.union([
  v.literal("playing"),
  v.literal("finished"),
])

export const VGameInfo = v.object({
  gid: VNanoId,
  players: VGameSide,
  status: VGameStatus,
  steps: v.array(Action),
})

export const VGameGet = {
  ParamByGid: {
    Param: v.object({
      gid: VNanoId,
    }),
    Response: VResponseWrap_(VGameInfo),
  } as const,
  QueryByUid: {
    Query: v.object({
      uid: VUserId,
    }),
    Response: VResponseWrap_(v.array(VGameInfo)),
  } as const,
} as const

export const VGamePost = {
  Body: v.object({
    players: VGameSide,
  }),
  Response: VResponseWrap_(VNanoId),
} as const

export const VGamePatch = {
  ParamByGid: {
    Param: v.object({
      gid: VNanoId,
    }),
    Body: v.partial(v.pick(VGameInfo, ["status", "steps"])),
  } as const,
} as const

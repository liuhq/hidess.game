import { v, VNanoId, VResponseWrap_, VUserId } from "#/schema"
import { VGameInfo } from "../game/schema"

export const VUserStatus = v.union([
  v.literal("playing"),
  v.literal("online"),
  v.literal("offline"),
])

export const VUserInfo = v.object({
  uid: VUserId,
  status: VUserStatus,
  current_gid: v.optional(VNanoId),
  history: v.array(VGameInfo),
})

export const VUserGet = {
  ParamByUid: {
    Param: v.object({
      uid: VUserId,
    }),
    Response: VResponseWrap_(VUserInfo),
  } as const,
} as const

export const VUserPost = {
  Body: v.object({
    uid: VUserId,
  }),
} as const

export const VUserPatch = {
  ParamByUid: {
    Param: v.object({
      uid: VUserId,
    }),
    Body: v.pick(VUserInfo, ["status", "current_gid", "history"]),
    Response: VResponseWrap_(VUserInfo),
  } as const,
} as const

export const VUserDelete = {
  ParamByUid: {
    Param: v.object({
      uid: VUserId,
    }),
  } as const,
} as const

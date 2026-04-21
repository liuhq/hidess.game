import { UserId } from "#/api/user"
import { NanoId } from "#/utils"
import type { WsConn } from "#/ws"
import type { Side } from "@hidess/shared"
import * as v from "valibot"

export interface Gaming {
  gid: NanoId
  players: {
    [s in Side]: {
      uid: UserId
      conn: WsConn
    }
  }
}

export const RoomInfo = v.pipe(
  v.object({
    players: v.pipe(
      v.array(UserId),
      v.minLength(1),
    ),
    gaming: v.array(NanoId),
    history: v.array(NanoId),
  }),
)

export type RoomInfo = v.InferInput<typeof RoomInfo>

export type GameMap = Map<NanoId, Gaming>
export type RoomMap = Map<NanoId, GameMap>

export const GAME_STORE: GameMap = new Map()
export const ROOM_STORE: RoomMap = new Map()

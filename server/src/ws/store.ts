import type { UserId } from "#/api/user"
import type { WSContext } from "hono/ws"

export type WsConn = WSContext<WebSocket>

export function createUserWsMap(initMap?: Map<UserId, WsConn>) {
  const map = new Map<UserId, WsConn>(initMap)

  return {
    get map() {
      return map as ReadonlyMap<UserId, WsConn>
    },
    connect: (uid: UserId, ws: WsConn) => {
      const oldWs = map.get(uid)
      oldWs?.close()
      map.set(uid, ws)
    },
    disconnect: (uid: UserId) => {
      map.delete(uid)
    },
    ws: (uid: UserId) => {
      const ws = map.get(uid)
      if (!ws) {
        return { ws: null, error: new Error(`WebSocket not found: ${uid}`) }
      }
      return { ws, error: null }
    },
  } as const
}

export const USER_WS = createUserWsMap()

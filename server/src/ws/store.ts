import type { VUserId } from "#/schema"
import type { WSContext } from "hono/ws"

export type WsConn = WSContext<WebSocket>

export function createUserWsMap(initMap?: Map<VUserId, WsConn>) {
  const map = new Map<VUserId, WsConn>(initMap)

  return {
    get map() {
      return map as ReadonlyMap<VUserId, WsConn>
    },
    connect: (uid: VUserId, ws: WsConn) => {
      const oldWs = map.get(uid)
      oldWs?.close()
      map.set(uid, ws)
    },
    disconnect: (uid: VUserId) => {
      map.delete(uid)
    },
    ws: (uid: VUserId) => {
      const ws = map.get(uid)
      if (!ws) {
        return { ws: null, error: new Error(`WebSocket not found: ${uid}`) }
      }
      return { ws, error: null }
    },
  } as const
}

export const USER_WS = createUserWsMap()

import { Board } from "../game"
import { PieceState, Vec2 } from "../piece"
import type { Action, PieceRule } from "../rule"
import { canCapture, getOccupant } from "./shared"

const DIRS: [number, number][] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

function inBoard(x: number, y: number) {
  return x >= 0 && x < Board.WIDTH && y >= 0 && y < Board.HEIGHT
}

const cannonRule: PieceRule = (state, piece): Action[] => {
  const actions: Action[] = []

  const [x, y] = piece.position

  for (const [dx, dy] of DIRS) {
    // Move: adjacent empty square
    const adjX = x + dx
    const adjY = y + dy
    if (inBoard(adjX, adjY)) {
      const adjPiece = getOccupant(state.pieces, [adjX, adjY])
      if (!adjPiece) {
        actions.push({ type: "move", pid: piece.pid, to: [adjX, adjY] })
      }
    }

    // Capture: scan for [screen] ... [target]
    let screenFound = false
    let cx = x + dx
    let cy = y + dy

    while (inBoard(cx, cy)) {
      const at = getOccupant(state.pieces, [cx, cy])

      if (!screenFound) {
        if (at) {
          screenFound = true
        }
        cx += dx
        cy += dy
        continue
      }

      // Past the screen
      if (
        at
        && at.state === PieceState.Active
        && at.side !== piece.side
      ) {
        if (canCapture(piece.kind, at.kind)) {
          actions.push({
            type: "capture",
            pid: piece.pid,
            targetPid: at.pid,
            to: [cx, cy],
          })
        }
        break
      }

      // Friendly/hidden piece past the screen blocks further scanning
      if (at) break

      cx += dx
      cy += dy
    }
  }

  return actions
}

export default cannonRule

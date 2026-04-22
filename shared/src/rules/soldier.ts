import { Piece, Vec2 } from "../piece"
import type { _Action, PieceRule } from "../rule"

const soldierRule: PieceRule = (state, piece): _Action[] => {
  const actions: _Action[] = []

  const [x, y] = piece.position

  const up: Vec2 = [x, Math.max(y - 1, 0)]
  const right: Vec2 = [x + 1, y]
  const down: Vec2 = [x, y + 1]
  const left: Vec2 = [Math.max(x - 1, 0), y]

  const targetUp = Piece.getPieceAt(state.pieces, up)
  const targetRight = Piece.getPieceAt(state.pieces, right)
  const targetDown = Piece.getPieceAt(state.pieces, down)
  const targetLeft = Piece.getPieceAt(state.pieces, left)

  !targetUp && actions.push({ type: "move", pid: piece.pid, to: up })
  !targetRight && actions.push({ type: "move", pid: piece.pid, to: right })
  !targetDown && actions.push({ type: "move", pid: piece.pid, to: down })
  !targetLeft && actions.push({ type: "move", pid: piece.pid, to: left })

  targetUp && targetUp.side !== piece.side && actions.push({
    type: "capture",
    pid: piece.pid,
    targetPid: targetUp.pid,
    to: up,
  })
  targetRight && targetRight.side !== piece.side && actions.push({
    type: "capture",
    pid: piece.pid,
    targetPid: targetRight.pid,
    to: right,
  })
  targetDown && targetDown.side !== piece.side && actions.push({
    type: "capture",
    pid: piece.pid,
    targetPid: targetDown.pid,
    to: down,
  })
  targetLeft && targetLeft.side !== piece.side && actions.push({
    type: "capture",
    pid: piece.pid,
    targetPid: targetLeft.pid,
    to: left,
  })

  return actions
}

export default soldierRule

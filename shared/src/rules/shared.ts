import { Board } from "../game"
import { Piece, PieceKind, PieceState, Vec2 } from "../piece"
import type { Action, PieceRule } from "../rule"

export const RANK: Record<PieceKind, number> = {
  General: 1,
  Advisor: 2,
  Elephant: 3,
  Chariot: 4,
  Horse: 5,
  Cannon: 6,
  Soldier: 7,
}

export function canCapture(attacker: PieceKind, target: PieceKind) {
  if (attacker === PieceKind.General && target === PieceKind.Soldier) {
    return false
  }
  if (attacker === PieceKind.Soldier && target === PieceKind.General) {
    return true
  }
  return RANK[attacker] <= RANK[target]
}

function getOccupant(pieces: Piece[], pos: Vec2) {
  return pieces.find(
    (p) =>
      Vec2.eq(p.position, pos) && p.state !== PieceState.Captured,
  )
}

export { getOccupant }

export const adjacentActions: PieceRule = (state, piece) => {
  const actions: Action[] = []

  const [x, y] = piece.position

  const up: Vec2 = [x, Math.max(y - 1, 0)]
  const right: Vec2 = [Math.min(x + 1, Board.WIDTH - 1), y]
  const down: Vec2 = [x, Math.min(y + 1, Board.HEIGHT - 1)]
  const left: Vec2 = [Math.max(x - 1, 0), y]

  const targetUp = getOccupant(state.pieces, up)
  const targetRight = getOccupant(state.pieces, right)
  const targetDown = getOccupant(state.pieces, down)
  const targetLeft = getOccupant(state.pieces, left)

  if (!targetUp) {
    actions.push({ type: "move", pid: piece.pid, to: up })
  } else if (
    targetUp.state === PieceState.Active
    && targetUp.side !== piece.side
    && canCapture(piece.kind, targetUp.kind)
  ) {
    actions.push({
      type: "capture",
      pid: piece.pid,
      targetPid: targetUp.pid,
      to: up,
    })
  }

  if (!targetRight) {
    actions.push({ type: "move", pid: piece.pid, to: right })
  } else if (
    targetRight.state === PieceState.Active
    && targetRight.side !== piece.side
    && canCapture(piece.kind, targetRight.kind)
  ) {
    actions.push({
      type: "capture",
      pid: piece.pid,
      targetPid: targetRight.pid,
      to: right,
    })
  }

  if (!targetDown) {
    actions.push({ type: "move", pid: piece.pid, to: down })
  } else if (
    targetDown.state === PieceState.Active
    && targetDown.side !== piece.side
    && canCapture(piece.kind, targetDown.kind)
  ) {
    actions.push({
      type: "capture",
      pid: piece.pid,
      targetPid: targetDown.pid,
      to: down,
    })
  }

  if (!targetLeft) {
    actions.push({ type: "move", pid: piece.pid, to: left })
  } else if (
    targetLeft.state === PieceState.Active
    && targetLeft.side !== piece.side
    && canCapture(piece.kind, targetLeft.kind)
  ) {
    actions.push({
      type: "capture",
      pid: piece.pid,
      targetPid: targetLeft.pid,
      to: left,
    })
  }

  return actions
}

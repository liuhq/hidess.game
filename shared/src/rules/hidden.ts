import type { Action, PieceRule } from "../rule"

const hiddenRule: PieceRule = (_state, piece): Action[] => {
  return [{ type: "reveal", pid: piece.pid }]
}

export default hiddenRule

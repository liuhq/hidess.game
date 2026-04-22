import type { _Action, PieceRule } from "../rule"

const hiddenRule: PieceRule = (_state, piece): _Action[] => {
  return [{ type: "reveal", pid: piece.pid }]
}

export default hiddenRule

import { type GameState, Side } from "./game"
import { Piece, PieceKind, PieceState, Vec2 } from "./piece"
import hiddenRule from "./rules/hidden"
import soldierRule from "./rules/soldier"

export type Action =
  | { type: "reveal"; pid: string }
  | { type: "move"; pid: string; to: Vec2 }
  | { type: "capture"; pid: string; targetPid: string; to: Vec2 }

export type PieceRule = (state: GameState, piece: Piece) => Action[]

const pieceRules: Record<
  PieceKind | typeof PieceState.Hidden,
  PieceRule
> = {
  Hidden: hiddenRule,
  Soldier: soldierRule,
}

const getValidActions = (state: GameState, pid: string): Action[] => {
  const piece = state.pieces.find((p) => p.pid === pid)

  if (!piece) return []

  const ruleKind = piece.state === PieceState.Hidden ? piece.state : piece.kind
  const rule = pieceRules[ruleKind]
  return rule(state, piece)
}

const applyAction = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case "reveal": {
      return {
        ...state,
        selectedPid: null,
        turn: state.turn === Side.Black ? Side.Red : Side.Black,
        pieces: state.pieces
          .map((p) =>
            p.pid === action.pid
              ? { ...p, state: PieceState.Active }
              : p
          ),
      }
    }
    case "move": {
      return {
        ...state,
        selectedPid: null,
        turn: state.turn === Side.Black ? Side.Red : Side.Black,
        pieces: state.pieces
          .map((p) =>
            p.pid === action.pid
              ? { ...p, position: action.to }
              : p
          ),
      }
    }
    case "capture": {
      return {
        ...state,
        selectedPid: null,
        turn: state.turn === Side.Black ? Side.Red : Side.Black,
        pieces: state.pieces
          .filter((p) => p.pid !== action.targetPid)
          .map((p) =>
            p.pid === action.pid
              ? { ...p, position: action.to }
              : p
          ),
      }
    }
  }
}

const resolveSquareClick = (
  state: GameState,
  clickPos: Vec2,
): GameState => {
  const clickPiece = Piece.getPieceAt(state.pieces, clickPos)

  // 未选中
  if (!state.selectedPid) {
    // 翻开暗棋
    if (clickPiece && clickPiece.state === PieceState.Hidden) {
      const actions = getValidActions(state, clickPiece.pid)
      const action = actions.find((a) => a.type === "reveal")

      if (!action) {
        return { ...state, selectedPid: null }
      }

      return applyAction(state, action)
    }

    // 只能选中当前回合己方棋子
    if (clickPiece && clickPiece.side === state.turn) {
      return { ...state, selectedPid: clickPiece.pid }
    }

    return state
  }

  const selectedPiece = state.pieces.find((p) => p.pid === state.selectedPid)
  if (!selectedPiece) {
    return { ...state, selectedPid: null }
  }

  // 点击自己：取消选中
  if (Vec2.eq(selectedPiece.position, clickPos)) {
    return { ...state, selectedPid: null }
  }

  // 点击己方其它棋子：切换选中
  if (clickPiece && clickPiece.side === selectedPiece.side) {
    return { ...state, selectedPid: clickPiece.pid }
  }

  const actions = getValidActions(state, selectedPiece.pid)
  const action = actions.find((a) => {
    if (!("to" in a)) return false
    return Vec2.eq(a.to, clickPos)
  })

  if (!action) {
    return { ...state, selectedPid: null }
  }

  return applyAction(state, action)
}

export const Rule = {
  getValidActions,
  resolveSquareClick,
} as const

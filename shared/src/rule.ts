import * as v from "valibot"
import { type GameState, hashState, Side } from "./game"
import { Piece, PieceKind, PieceState, Vec2 } from "./piece"
import advisorRule from "./rules/advisor"
import cannonRule from "./rules/cannon"
import chariotRule from "./rules/chariot"
import elephantRule from "./rules/elephant"
import generalRule from "./rules/general"
import hiddenRule from "./rules/hidden"
import horseRule from "./rules/horse"
import soldierRule from "./rules/soldier"

export const Action = v.variant("type", [
  v.object({
    type: v.literal("reveal"),
    pid: v.string(),
  }),
  v.object({
    type: v.literal("move"),
    pid: v.string(),
    to: v.strictTuple([v.number(), v.number()]),
  }),
  v.object({
    type: v.literal("capture"),
    pid: v.string(),
    targetPid: v.string(),
    to: v.strictTuple([v.number(), v.number()]),
  }),
])

export type Action = v.InferOutput<typeof Action>

export type PieceRule = (state: GameState, piece: Piece) => Action[]

const pieceRules: Record<
  PieceKind | typeof PieceState.Hidden,
  PieceRule
> = {
  Hidden: hiddenRule,
  General: generalRule,
  Advisor: advisorRule,
  Elephant: elephantRule,
  Chariot: chariotRule,
  Horse: horseRule,
  Cannon: cannonRule,
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

  if (!state.selectedPid) {
    if (clickPiece && clickPiece.state === PieceState.Hidden) {
      const actions = getValidActions(state, clickPiece.pid)
      const action = actions.find((a) => a.type === "reveal")

      if (!action) {
        return { ...state, selectedPid: null }
      }

      return applyAction(state, action)
    }

    if (clickPiece && clickPiece.side === state.turn) {
      return { ...state, selectedPid: clickPiece.pid }
    }

    return state
  }

  const selectedPiece = state.pieces.find((p) => p.pid === state.selectedPid)
  if (!selectedPiece) {
    return { ...state, selectedPid: null }
  }

  if (Vec2.eq(selectedPiece.position, clickPos)) {
    return { ...state, selectedPid: null }
  }

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

const isStalemate = (history: string[]) => {
  if (history.length < 3) return false
  const current = history[history.length - 1]!
  let count = 0
  for (const h of history) {
    if (h === current) count++
  }
  return count >= 3
}

export const Rule = {
  getValidActions,
  resolveSquareClick,
  isStalemate,
} as const

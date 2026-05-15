import type { Piece } from "./piece"

export const Side = {
  Red: "Red",
  Black: "Black",
} as const

export type Side = typeof Side[keyof typeof Side]

export const Board = {
  WIDTH: 4,
  HEIGHT: 8,
} as const

export interface GameState {
  pieces: Piece[]
  selectedPid: string | null
  turn: Side
}

export function hashState(state: GameState) {
  const positions = state.pieces
    .map((p) => `${p.kind[0]}${p.side[0]}${p.position[0]},${p.position[1]}`)
    .sort()
    .join("|")
  return `${state.turn}|${positions}`
}

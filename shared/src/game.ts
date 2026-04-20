import type { Piece } from "./piece"

export const Side = {
  Red: "Red",
  Black: "Black",
} as const

export type Side = typeof Side[keyof typeof Side]

export interface GameState {
  pieces: Piece[]
  selectedPid: string | null
  turn: Side
}

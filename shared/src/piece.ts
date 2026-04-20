import type { Side } from "./game"

/** [col, row] or [x, y] */
export type Vec2 = [number, number]

export const Vec2 = {
  toString: (vec: Vec2) => `${vec[0]}-${vec[1]}`,
  eq: (l: Vec2, r: Vec2) => l[0] === r[0] && l[1] === r[1],
} as const

export const PieceKind = {
  /** 将/帅 */
  General: "General",
  /** 士/仕 */
  Advisor: "Advisor",
  /** 相/象 */
  Elephant: "Elephant",
  /** 马/傌 */
  Horse: "Horse",
  /** 车/俥 */
  Chariot: "Chariot",
  /** 炮/砲 */
  Cannon: "Cannon",
  /** 卒/兵 */
  Soldier: "Soldier",
} as const

export type PieceKind = typeof PieceKind[keyof typeof PieceKind]

export const PieceState = {
  /** 在场上 */
  Active: "Active",
  /** 已被吃掉 */
  Captured: "Captured",
  /** 暗棋未翻开 */
  Hidden: "Hidden",
} as const

export type PieceState = typeof PieceState[keyof typeof PieceState]

export interface Piece {
  readonly pid: string
  kind: PieceKind
  side: Side
  position: Vec2
  state: PieceState
}

export const Piece = {
  generatePid: (pos: Vec2) => Vec2.toString(pos),
  getPieceAt: (pieces: Piece[], pos: Vec2) =>
    pieces.find((p) =>
      Vec2.eq(p.position, pos) && p.state === PieceState.Active
    ),
} as const

import { describe, expect, it } from "vitest"
import { hashState } from "../game"
import type { GameState } from "../game"
import { Side } from "../game"
import { Piece, PieceKind, PieceState, Vec2 } from "../piece"
import { Rule } from "../rule"
import { default as cannonRule } from "./cannon"
import { adjacentActions, canCapture, RANK } from "./shared"

function makePiece(
  kind: PieceKind,
  side: Side,
  pos: Vec2,
  state = PieceState.Active,
) {
  return {
    pid: Vec2.toString(pos),
    kind,
    side,
    position: pos,
    state,
  } as Piece
}

function makeState(pieces: Piece[], turn: Side = Side.Red): GameState {
  return { pieces, selectedPid: null, turn }
}

describe("RANK", () => {
  it("General is highest (rank 1)", () => {
    expect(RANK.General).toBe(1)
  })

  it("Soldier is lowest (rank 7)", () => {
    expect(RANK.Soldier).toBe(7)
  })

  it("Taiwanese order: General < Advisor < Elephant < Chariot < Horse < Cannon < Soldier", () => {
    expect(RANK.General).toBeLessThan(RANK.Advisor)
    expect(RANK.Advisor).toBeLessThan(RANK.Elephant)
    expect(RANK.Elephant).toBeLessThan(RANK.Chariot)
    expect(RANK.Chariot).toBeLessThan(RANK.Horse)
    expect(RANK.Horse).toBeLessThan(RANK.Cannon)
    expect(RANK.Cannon).toBeLessThan(RANK.Soldier)
  })
})

describe("canCapture", () => {
  it("higher rank captures lower rank", () => {
    expect(canCapture(PieceKind.General, PieceKind.Advisor)).toBe(true)
    expect(canCapture(PieceKind.Advisor, PieceKind.Soldier)).toBe(true)
    expect(canCapture(PieceKind.Chariot, PieceKind.Cannon)).toBe(true)
  })

  it("equal rank can capture each other", () => {
    expect(canCapture(PieceKind.Soldier, PieceKind.Soldier)).toBe(true)
    expect(canCapture(PieceKind.General, PieceKind.General)).toBe(true)
  })

  it("lower rank cannot capture higher rank", () => {
    expect(canCapture(PieceKind.Soldier, PieceKind.General)).toBe(true) // exception
    expect(canCapture(PieceKind.Soldier, PieceKind.Advisor)).toBe(false)
    expect(canCapture(PieceKind.Cannon, PieceKind.Chariot)).toBe(false)
    expect(canCapture(PieceKind.Horse, PieceKind.Elephant)).toBe(false)
  })

  it("General cannot capture Soldier", () => {
    expect(canCapture(PieceKind.General, PieceKind.Soldier)).toBe(false)
  })

  it("Soldier can capture General (exception)", () => {
    expect(canCapture(PieceKind.Soldier, PieceKind.General)).toBe(true)
  })

  it("General can capture General", () => {
    expect(canCapture(PieceKind.General, PieceKind.General)).toBe(true)
  })
})

describe("adjacentActions", () => {
  it("generates move actions to empty adjacent squares", () => {
    const piece = makePiece(PieceKind.Soldier, Side.Red, [1, 1])
    const state = makeState([piece])

    const actions = adjacentActions(state, piece)
    const moves = actions.filter((a) => a.type === "move")
    // Up, Right, Down, Left from [1,1]
    expect(moves).toHaveLength(4)
    expect(moves.map((m) => m.to)).toContainEqual([1, 0])
    expect(moves.map((m) => m.to)).toContainEqual([2, 1])
    expect(moves.map((m) => m.to)).toContainEqual([1, 2])
    expect(moves.map((m) => m.to)).toContainEqual([0, 1])
  })

  it("does not move off the top edge", () => {
    const piece = makePiece(PieceKind.Soldier, Side.Red, [0, 0])
    const state = makeState([piece])

    const actions = adjacentActions(state, piece)
    const moves = actions.filter((a) => a.type === "move")
    expect(moves.map((m) => m.to)).not.toContainEqual([0, -1])
  })

  it("does not move off the right edge", () => {
    const piece = makePiece(PieceKind.Soldier, Side.Red, [3, 0])
    const state = makeState([piece])

    const actions = adjacentActions(state, piece)
    const moves = actions.filter((a) => a.type === "move")
    expect(moves.map((m) => m.to)).not.toContainEqual([4, 0])
  })

  it("does not move off the bottom edge", () => {
    const piece = makePiece(PieceKind.Soldier, Side.Red, [0, 7])
    const state = makeState([piece])

    const actions = adjacentActions(state, piece)
    const moves = actions.filter((a) => a.type === "move")
    expect(moves.map((m) => m.to)).not.toContainEqual([0, 8])
  })

  it("does not move off the left edge", () => {
    const piece = makePiece(PieceKind.Soldier, Side.Red, [0, 0])
    const state = makeState([piece])

    const actions = adjacentActions(state, piece)
    const moves = actions.filter((a) => a.type === "move")
    expect(moves.map((m) => m.to)).not.toContainEqual([-1, 0])
  })

  it("generates capture action for capturable enemy", () => {
    const soldier = makePiece(PieceKind.Soldier, Side.Red, [1, 1])
    const enemyGeneral = makePiece(PieceKind.General, Side.Black, [1, 0])
    const state = makeState([soldier, enemyGeneral])

    const actions = adjacentActions(state, soldier)
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(1)
    expect(captures[0]!.targetPid).toBe(enemyGeneral.pid)
  })

  it("does not capture uncapturable enemy", () => {
    const general = makePiece(PieceKind.General, Side.Red, [1, 1])
    const enemySoldier = makePiece(PieceKind.Soldier, Side.Black, [1, 0])
    const state = makeState([general, enemySoldier])

    const actions = adjacentActions(state, general)
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(0)
  })

  it("does not capture own pieces", () => {
    const piece = makePiece(PieceKind.General, Side.Red, [1, 1])
    const ally = makePiece(PieceKind.Soldier, Side.Red, [1, 0])
    const state = makeState([piece, ally])

    const actions = adjacentActions(state, piece)
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(0)
  })
})

describe("cannonRule", () => {
  it("moves to empty adjacent squares (1 step, 4 dirs)", () => {
    const cannon = makePiece(PieceKind.Cannon, Side.Red, [1, 1])
    const state = makeState([cannon])

    const actions = cannonRule(state, cannon)
    const moves = actions.filter((a) => a.type === "move")
    expect(moves).toHaveLength(4)
  })

  it("captures via screen: [cannon][empty][screen][empty][enemy]", () => {
    const cannon = makePiece(PieceKind.Cannon, Side.Red, [0, 0])
    const screen = makePiece(PieceKind.Soldier, Side.Red, [0, 2])
    const enemy = makePiece(PieceKind.Soldier, Side.Black, [0, 4])
    const state = makeState([cannon, screen, enemy])

    const actions = cannonRule(state, cannon)
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(1)
    expect(captures[0]!.targetPid).toBe(enemy.pid)
    expect(captures[0]!.to).toEqual([0, 4])
  })

  it("cannot capture without a screen (adjacent enemy)", () => {
    const cannon = makePiece(PieceKind.Cannon, Side.Red, [0, 0])
    const enemy = makePiece(PieceKind.Soldier, Side.Black, [0, 1])
    const state = makeState([cannon, enemy])

    const actions = cannonRule(state, cannon)
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(0)
  })

  it("requires exactly one screen between cannon and target", () => {
    const cannon = makePiece(PieceKind.Cannon, Side.Red, [0, 0])
    const screen1 = makePiece(PieceKind.Soldier, Side.Red, [0, 1])
    const screen2 = makePiece(PieceKind.Horse, Side.Black, [0, 3])
    const enemy = makePiece(PieceKind.Soldier, Side.Black, [0, 5])
    const state = makeState([cannon, screen1, screen2, enemy])

    const actions = cannonRule(state, cannon)
    // screen1 is the screen; screen2 blocks scanning past it
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(0)
  })

  it("screen can be any piece (friend, foe, face-up)", () => {
    const cannon = makePiece(PieceKind.Cannon, Side.Red, [0, 0])
    const screen = makePiece(PieceKind.Horse, Side.Black, [0, 2])
    const enemy = makePiece(PieceKind.Soldier, Side.Black, [0, 3])
    const state = makeState([cannon, screen, enemy])

    const actions = cannonRule(state, cannon)
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(1)
    expect(captures[0]!.targetPid).toBe(enemy.pid)
  })

  it("screen can be a hidden piece", () => {
    const cannon = makePiece(PieceKind.Cannon, Side.Red, [0, 0])
    const screen = makePiece(
      PieceKind.Soldier,
      Side.Red,
      [0, 2],
      PieceState.Hidden,
    )
    const enemy = makePiece(PieceKind.Soldier, Side.Black, [0, 4])
    const state = makeState([cannon, screen, enemy])

    const actions = cannonRule(state, cannon)
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(1)
  })

  it("cannot capture own pieces past the screen", () => {
    const cannon = makePiece(PieceKind.Cannon, Side.Red, [0, 0])
    const screen = makePiece(PieceKind.Horse, Side.Red, [0, 2])
    const ally = makePiece(PieceKind.Soldier, Side.Red, [0, 4])
    const state = makeState([cannon, screen, ally])

    const actions = cannonRule(state, cannon)
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(0)
  })

  it("cannot capture uncapturable enemy past screen (rank check)", () => {
    const cannon = makePiece(PieceKind.Cannon, Side.Red, [0, 0])
    const screen = makePiece(PieceKind.Horse, Side.Red, [0, 2])
    // Soldier cannot cannon-capture a General? Wait no, cannon can capture ANY piece
    // But canon is rank 6, General is rank 1, so cannon CAN capture General
    // Actually let me test: cannon vs chariot (rank 4) — cannon (rank 6) can't capture chariot
    const enemy = makePiece(PieceKind.Chariot, Side.Black, [0, 4])
    const state = makeState([cannon, screen, enemy])

    const actions = cannonRule(state, cannon)
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(0)
  })

  it("scans all 4 directions for screens and targets", () => {
    const cannon = makePiece(PieceKind.Cannon, Side.Red, [1, 4])
    const upScreen = makePiece(PieceKind.Soldier, Side.Red, [1, 2])
    const upEnemy = makePiece(PieceKind.Soldier, Side.Black, [1, 0])
    const downScreen = makePiece(PieceKind.Horse, Side.Red, [1, 6])
    const downEnemy = makePiece(PieceKind.Soldier, Side.Black, [1, 7])
    const state = makeState([
      cannon,
      upScreen,
      upEnemy,
      downScreen,
      downEnemy,
    ])

    const actions = cannonRule(state, cannon)
    const captures = actions.filter((a) => a.type === "capture")
    expect(captures).toHaveLength(2)
    expect(captures.map((c) => c.targetPid)).toContain(upEnemy.pid)
    expect(captures.map((c) => c.targetPid)).toContain(downEnemy.pid)
  })
})

describe("hashState", () => {
  it("produces same hash for identical states", () => {
    const piece = makePiece(PieceKind.Soldier, Side.Red, [1, 1])
    const state = makeState([piece])
    expect(hashState(state)).toBe(hashState({ ...state }))
  })

  it("produces different hash for different turn", () => {
    const piece = makePiece(PieceKind.Soldier, Side.Red, [1, 1])
    const red = makeState([piece], Side.Red)
    const black = makeState([piece], Side.Black)
    expect(hashState(red)).not.toBe(hashState(black))
  })

  it("produces different hash for different positions", () => {
    const a = makeState([makePiece(PieceKind.Soldier, Side.Red, [1, 1])])
    const b = makeState([makePiece(PieceKind.Soldier, Side.Red, [2, 2])])
    expect(hashState(a)).not.toBe(hashState(b))
  })
})

describe("Rule.isStalemate", () => {
  it("returns false when history has fewer than 3 entries", () => {
    expect(Rule.isStalemate(["a", "b"])).toBe(false)
  })

  it("returns false when no position repeats 3 times", () => {
    expect(Rule.isStalemate(["a", "b", "c", "d"])).toBe(false)
  })

  it("returns true when same position appears 3 times", () => {
    expect(Rule.isStalemate(["a", "b", "a", "a"])).toBe(true)
  })

  it("returns true when position repeats 3 times non-consecutively", () => {
    expect(Rule.isStalemate(["a", "b", "a", "c", "a"])).toBe(true)
  })
})

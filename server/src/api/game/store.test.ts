import Database from "better-sqlite3"
import { describe, expect, it } from "vitest"
import { createGameStore } from "./store"

function makeDb() {
  return new Database(":memory:")
}

describe("createGameStore", () => {
  describe("get", () => {
    it("returns null for unknown game", () => {
      const store = createGameStore(makeDb())
      expect(store.get("nonexist10")).toBeNull()
    })
  })

  describe("create", () => {
    it("creates a game with defaults", () => {
      const store = createGameStore(makeDb())
      const info = store.create({ Red: "alice", Black: "bob" })
      expect(info.status).toBe("playing")
      expect(info.players).toEqual({ Red: "alice", Black: "bob" })
      expect(info.steps).toEqual([])
      expect(info.gid).toHaveLength(10)
    })

    it("generates unique GIDs", () => {
      const db = makeDb()
      const store = createGameStore(db)
      const g1 = store.create({ Red: "alice", Black: "bob" })
      const g2 = store.create({ Red: "alice", Black: "bob" })
      expect(g1.gid).not.toBe(g2.gid)
    })

    it("persists to the database", () => {
      const db = makeDb()
      const store = createGameStore(db)
      const created = store.create({ Red: "alice", Black: "bob" })

      const store2 = createGameStore(db)
      const fetched = store2.get(created.gid)
      expect(fetched).not.toBeNull()
      expect(fetched!.gid).toBe(created.gid)
      expect(fetched!.players).toEqual({ Red: "alice", Black: "bob" })
    })
  })

  describe("getByUid", () => {
    it("returns empty array for user with no games", () => {
      const store = createGameStore(makeDb())
      expect(store.getByUid("alice")).toEqual([])
    })

    it("returns games where user is Red", () => {
      const store = createGameStore(makeDb())
      const g1 = store.create({ Red: "alice", Black: "bob" })
      store.create({ Red: "charlie", Black: "dave" })

      const games = store.getByUid("alice")
      expect(games).toHaveLength(1)
      expect(games[0]!.gid).toBe(g1.gid)
    })

    it("returns games where user is Black", () => {
      const store = createGameStore(makeDb())
      const g1 = store.create({ Red: "alice", Black: "bob" })

      const games = store.getByUid("bob")
      expect(games).toHaveLength(1)
      expect(games[0]!.gid).toBe(g1.gid)
    })

    it("returns all games for user on either side", () => {
      const store = createGameStore(makeDb())
      store.create({ Red: "alice", Black: "bob" })
      store.create({ Red: "bob", Black: "charlie" })
      store.create({ Red: "dave", Black: "alice" })

      expect(store.getByUid("alice")).toHaveLength(2)
      expect(store.getByUid("bob")).toHaveLength(2)
      expect(store.getByUid("charlie")).toHaveLength(1)
      expect(store.getByUid("dave")).toHaveLength(1)
    })
  })

  describe("update", () => {
    it("returns null for non-existent game", () => {
      const store = createGameStore(makeDb())
      const result = store.update("nonexist10", { status: "finished" })
      expect(result).toEqual({ info: null, changed: false })
    })

    it("updates status", () => {
      const store = createGameStore(makeDb())
      const game = store.create({ Red: "alice", Black: "bob" })

      const { info, changed } = store.update(game.gid, {
        status: "finished",
      })
      expect(changed).toBe(true)
      expect(info!.status).toBe("finished")
    })

    it("updates steps", () => {
      const store = createGameStore(makeDb())
      const game = store.create({ Red: "alice", Black: "bob" })

      const steps = [
        { type: "reveal" as const, pid: "p1" },
        { type: "move" as const, pid: "p2", to: [0, 1] as [number, number] },
      ]

      const { info, changed } = store.update(game.gid, { steps })
      expect(changed).toBe(true)
      expect(info!.steps).toEqual(steps)
    })

    it("round-trips steps through JSON", () => {
      const db = makeDb()
      const store = createGameStore(db)
      const game = store.create({ Red: "alice", Black: "bob" })

      const steps = [
        { type: "reveal" as const, pid: "p1" },
        {
          type: "capture" as const,
          pid: "p2",
          targetPid: "p3",
          to: [0, 1] as [number, number],
        },
      ]

      store.update(game.gid, { steps })

      const store2 = createGameStore(db)
      expect(store2.get(game.gid)!.steps).toEqual(steps)
    })

    it("returns changed=false for empty patch", () => {
      const store = createGameStore(makeDb())
      const game = store.create({ Red: "alice", Black: "bob" })

      const { info, changed } = store.update(game.gid, {})
      expect(changed).toBe(false)
      expect(info!.gid).toBe(game.gid)
    })

    it("returns changed=false when patch matches existing values", () => {
      const store = createGameStore(makeDb())
      const game = store.create({ Red: "alice", Black: "bob" })

      const { changed } = store.update(game.gid, { status: "playing" })
      expect(changed).toBe(false)
    })

    it("does not reset unspecified fields", () => {
      const store = createGameStore(makeDb())
      const game = store.create({ Red: "alice", Black: "bob" })
      store.update(game.gid, {
        status: "finished",
        steps: [{ type: "reveal" as const, pid: "p1" }],
      })

      const { info } = store.update(game.gid, {})
      expect(info!.status).toBe("finished")
      expect(info!.steps).toEqual([{ type: "reveal", pid: "p1" }])
    })
  })
})

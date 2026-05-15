import Database from "better-sqlite3"
import { describe, expect, it } from "vitest"
import { createUserStore } from "./store"

function makeDb() {
  return new Database(":memory:")
}

describe("createUserStore", () => {
  describe("get", () => {
    it("returns null for unknown user", () => {
      const store = createUserStore(makeDb())
      expect(store.get("alice")).toBeNull()
    })
  })

  describe("create", () => {
    it("creates a user with defaults", () => {
      const store = createUserStore(makeDb())
      const info = store.create("alice")
      expect(info).toEqual({
        uid: "alice",
        status: "online",
        current_gid: undefined,
        history: [],
      })
    })

    it("throws on duplicate uid", () => {
      const store = createUserStore(makeDb())
      store.create("alice")
      expect(() => store.create("alice")).toThrow()
    })

    it("persists to the database", () => {
      const db = makeDb()
      const store = createUserStore(db)
      store.create("alice")

      // A new store backed by the same in-memory DB sees the data
      const store2 = createUserStore(db)
      const info = store2.get("alice")
      expect(info).toEqual({
        uid: "alice",
        status: "online",
        current_gid: undefined,
        history: [],
      })
    })
  })

  describe("update", () => {
    it("returns null for non-existent user", () => {
      const store = createUserStore(makeDb())
      const result = store.update("ghost", { status: "online" })
      expect(result).toEqual({ info: null, changed: false })
    })

    it("updates status", () => {
      const store = createUserStore(makeDb())
      store.create("alice")

      const { info, changed } = store.update("alice", { status: "playing" })
      expect(changed).toBe(true)
      expect(info!.status).toBe("playing")
      expect(info!.uid).toBe("alice")
    })

    it("updates current_gid", () => {
      const store = createUserStore(makeDb())
      store.create("alice")

      const { info, changed } = store.update("alice", {
        current_gid: "abc1234567",
      })
      expect(changed).toBe(true)
      expect(info!.current_gid).toBe("abc1234567")
    })

    it("clears current_gid when set to undefined", () => {
      const store = createUserStore(makeDb())
      store.create("alice")
      store.update("alice", { current_gid: "abc1234567" })

      const { info } = store.update("alice", { current_gid: undefined })
      expect(info!.current_gid).toBeUndefined()
    })

    it("updates history", () => {
      const store = createUserStore(makeDb())
      store.create("alice")

      const history = [
        {
          gid: "abc1234567",
          players: { Red: "alice", Black: "bob" },
          status: "finished" as const,
          steps: [],
        },
      ]

      const { info, changed } = store.update("alice", { history })
      expect(changed).toBe(true)
      expect(info!.history).toEqual(history)
    })

    it("round-trips history through JSON", () => {
      const db = makeDb()
      const store = createUserStore(db)
      store.create("alice")

      const history = [
        {
          gid: "abc1234567",
          players: { Red: "alice", Black: "bob" },
          status: "finished" as const,
          steps: [],
        },
      ]

      store.update("alice", { history })

      // A fresh store instance should read back the same JSON
      const store2 = createUserStore(db)
      expect(store2.get("alice")!.history).toEqual(history)
    })

    it("returns changed=false for empty patch", () => {
      const store = createUserStore(makeDb())
      store.create("alice")

      const { info, changed } = store.update("alice", {})
      expect(changed).toBe(false)
      expect(info!.uid).toBe("alice")
    })

    it("returns changed=false when patch matches existing values", () => {
      const store = createUserStore(makeDb())
      store.create("alice")

      const { changed } = store.update("alice", { status: "online" })
      expect(changed).toBe(false)
    })

    it("updates multiple fields at once", () => {
      const store = createUserStore(makeDb())
      store.create("alice")

      const history = [
        {
          gid: "test123456",
          players: { Red: "alice", Black: "bob" },
          status: "finished" as const,
          steps: [],
        },
      ]

      const { info, changed } = store.update("alice", {
        status: "playing",
        current_gid: "abc1234567",
        history,
      })
      expect(changed).toBe(true)
      expect(info).toEqual({
        uid: "alice",
        status: "playing",
        current_gid: "abc1234567",
        history,
      })
    })

    it("does not reset unspecified fields", () => {
      const store = createUserStore(makeDb())
      store.create("alice")
      store.update("alice", {
        status: "playing",
        current_gid: "abc1234567",
      })

      // Only update status, current_gid should stay
      const { info } = store.update("alice", { status: "offline" })
      expect(info!.status).toBe("offline")
      expect(info!.current_gid).toBe("abc1234567")
    })
  })
})

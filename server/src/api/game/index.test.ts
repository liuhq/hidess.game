import Database from "better-sqlite3"
import { Hono } from "hono"
import { describe, expect, it } from "vitest"
import { createUserRoutes } from "../user/index"
import { createUserStore } from "../user/store"
import { createGameRoutes } from "./index"
import { createGameStore } from "./store"

function makeApp() {
  const db = new Database(":memory:")
  const gameStore = createGameStore(db)
  const userStore = createUserStore(db)

  const app = new Hono()
  app.route("/", createGameRoutes(gameStore, userStore))
  app.route("/", createUserRoutes(userStore))

  return { app, gameStore, userStore }
}

describe("GET /game/:gid", () => {
  it("returns 400 for unknown game", async () => {
    const { app } = makeApp()
    const res = await app.request("/game/nonexist10")
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid GID format", async () => {
    const { app } = makeApp()
    const res = await app.request("/game/short")
    expect(res.status).toBe(400)
  })

  it("returns 200 with game data", async () => {
    const { app } = makeApp()
    // Create a game via POST
    const createRes = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "alice", Black: "bob" } }),
    })
    const { data: gid } = (await createRes.json()) as { data: string }

    const res = await app.request(`/game/${gid}`)
    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      data: { gid: string; players: { Red: string; Black: string }; status: string; steps: unknown[] }
    }
    expect(body.data.gid).toBe(gid)
    expect(body.data.players).toEqual({ Red: "alice", Black: "bob" })
    expect(body.data.status).toBe("playing")
    expect(body.data.steps).toEqual([])
  })
})

describe("GET /game?uid=", () => {
  it("returns empty array for user with no games", async () => {
    const { app } = makeApp()
    const res = await app.request("/game?uid=alice")
    expect(res.status).toBe(200)

    const body = (await res.json()) as { data: unknown[] }
    expect(body.data).toEqual([])
  })

  it("returns 400 for invalid UID format", async () => {
    const { app } = makeApp()
    const res = await app.request("/game?uid=a")
    expect(res.status).toBe(400)
  })

  it("returns games for a user on either side", async () => {
    const { app } = makeApp()
    // alice vs bob
    await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "alice", Black: "bob" } }),
    })
    // bob vs charlie
    const res2 = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "bob", Black: "charlie" } }),
    })
    const { data: gid2 } = (await res2.json()) as { data: string }

    const res = await app.request("/game?uid=bob")
    expect(res.status).toBe(200)

    const body = (await res.json()) as { data: Array<{ gid: string }> }
    expect(body.data).toHaveLength(2)

    // bob vs charlie
    await app.request(`/game/${gid2}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finished" }),
    })

    // Finished games still appear in history
    const res3 = await app.request("/game?uid=bob")
    expect(res3.status).toBe(200)
    const body3 = (await res3.json()) as { data: Array<{ gid: string }> }
    expect(body3.data).toHaveLength(2)
  })
})

describe("POST /game", () => {
  it("creates a game and returns the GID", async () => {
    const { app } = makeApp()
    const res = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "alice", Black: "bob" } }),
    })
    expect(res.status).toBe(200)

    const body = (await res.json()) as { data: string }
    expect(body.data).toHaveLength(10)
  })

  it("sets both players' current_gid and status", async () => {
    const { app } = makeApp()
    // Auto-create profiles via GET
    await app.request("/user/alice")
    await app.request("/user/bob")

    const res = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "alice", Black: "bob" } }),
    })
    const { data: gid } = (await res.json()) as { data: string }

    // Check alice's profile
    const aliceRes = await app.request("/user/alice")
    const aliceBody = (await aliceRes.json()) as {
      data: { current_gid: string; status: string }
    }
    expect(aliceBody.data.current_gid).toBe(gid)
    expect(aliceBody.data.status).toBe("playing")

    // Check bob's profile
    const bobRes = await app.request("/user/bob")
    const bobBody = (await bobRes.json()) as {
      data: { current_gid: string; status: string }
    }
    expect(bobBody.data.current_gid).toBe(gid)
    expect(bobBody.data.status).toBe("playing")
  })

  it("returns 400 for invalid player UIDs", async () => {
    const { app } = makeApp()
    const res = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "a", Black: "bob" } }),
    })
    expect(res.status).toBe(400)
  })

  it("returns 400 for missing Red player", async () => {
    const { app } = makeApp()
    const res = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Black: "bob" } }),
    })
    expect(res.status).toBe(400)
  })
})

describe("PATCH /game/:gid", () => {
  it("returns 204 on successful update", async () => {
    const { app } = makeApp()
    const createRes = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "alice", Black: "bob" } }),
    })
    const { data: gid } = (await createRes.json()) as { data: string }

    const res = await app.request(`/game/${gid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "finished",
        steps: [{ type: "reveal", pid: "p1" }],
      }),
    })
    expect(res.status).toBe(204)
  })

  it("returns 304 for no-change update", async () => {
    const { app } = makeApp()
    const createRes = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "alice", Black: "bob" } }),
    })
    const { data: gid } = (await createRes.json()) as { data: string }

    const res = await app.request(`/game/${gid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "playing" }),
    })
    expect(res.status).toBe(304)
  })

  it("returns 400 for non-existent game", async () => {
    const { app } = makeApp()
    const res = await app.request("/game/nonexist10", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finished" }),
    })
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid GID format", async () => {
    const { app } = makeApp()
    const res = await app.request("/game/short", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finished" }),
    })
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid status value", async () => {
    const { app } = makeApp()
    const createRes = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "alice", Black: "bob" } }),
    })
    const { data: gid } = (await createRes.json()) as { data: string }

    const res = await app.request(`/game/${gid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "invalid" }),
    })
    expect(res.status).toBe(400)
  })

  it("cascades finished game to player profiles", async () => {
    const { app } = makeApp()
    // Auto-create profiles
    await app.request("/user/alice")
    await app.request("/user/bob")

    const createRes = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "alice", Black: "bob" } }),
    })
    const { data: gid } = (await createRes.json()) as { data: string }

    // Add some steps
    await app.request(`/game/${gid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steps: [{ type: "reveal", pid: "p1" }],
      }),
    })

    // Finish the game
    const finishRes = await app.request(`/game/${gid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finished" }),
    })
    expect(finishRes.status).toBe(204)

    // Both players should have the game in history
    for (const uid of ["alice", "bob"]) {
      const userRes = await app.request(`/user/${uid}`)
      expect(userRes.status).toBe(200)
      const body = (await userRes.json()) as {
        data: {
          status: string
          current_gid: string | undefined
          history: Array<{ gid: string; status: string }>
        }
      }
      expect(body.data.status).toBe("online")
      expect(body.data.current_gid).toBeUndefined()
      expect(body.data.history).toHaveLength(1)
      expect(body.data.history[0]!.gid).toBe(gid)
      expect(body.data.history[0]!.status).toBe("finished")
    }
  })

  it("does not cascade on status change to playing", async () => {
    const { app } = makeApp()
    await app.request("/user/alice")
    await app.request("/user/bob")

    const createRes = await app.request("/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: { Red: "alice", Black: "bob" } }),
    })
    const { data: gid } = (await createRes.json()) as { data: string }

    // Finish then set back to playing (edge case)
    await app.request(`/game/${gid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finished" }),
    })

    // Now set to playing - should NOT cascade
    await app.request(`/game/${gid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "playing" }),
    })

    // History should still be 1 (from finish), not duplicated
    const userRes = await app.request("/user/alice")
    const body = (await userRes.json()) as {
      data: { history: Array<unknown> }
    }
    expect(body.data.history).toHaveLength(1)
  })
})

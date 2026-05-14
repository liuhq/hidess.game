import Database from "better-sqlite3"
import { describe, expect, it } from "vitest"
import { createUserRoutes } from "./index"
import { createUserStore } from "./store"

function makeApp() {
  const db = new Database(":memory:")
  const store = createUserStore(db)
  return createUserRoutes(store)
}

describe("GET /user/:uid", () => {
  it("returns 200 with auto-created profile for new user", async () => {
    const app = makeApp()
    const res = await app.request("/user/alice")
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toEqual({
      data: {
        uid: "alice",
        status: "online",
        history: [],
      },
    })
  })

  it("returns existing profile", async () => {
    const app = makeApp()
    // First request auto-creates
    await app.request("/user/bob")

    const res = await app.request("/user/bob")
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.data.uid).toBe("bob")
    expect(body.data.status).toBe("online")
  })

  it("returns 400 for uid shorter than 2 characters", async () => {
    const app = makeApp()
    const res = await app.request("/user/a")
    expect(res.status).toBe(400)
  })

  it("returns 400 for uid starting with a number", async () => {
    const app = makeApp()
    const res = await app.request("/user/123abc")
    expect(res.status).toBe(400)
  })

  it("returns 400 for uid with spaces", async () => {
    const app = makeApp()
    const res = await app.request("/user/al ice")
    expect(res.status).toBe(400)
  })

  it("returns 400 for uid with special characters", async () => {
    const app = makeApp()
    const res = await app.request("/user/alice@bob")
    expect(res.status).toBe(400)
  })
})

describe("PATCH /user/:uid", () => {
  it("updates status and returns 200", async () => {
    const app = makeApp()
    await app.request("/user/alice") // auto-create

    const res = await app.request("/user/alice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "playing" }),
    })
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.data.status).toBe("playing")
    expect(body.data.uid).toBe("alice")
  })

  it("returns 304 when patch matches current state", async () => {
    const app = makeApp()
    await app.request("/user/alice") // auto-create

    // Default status is "online"
    const res = await app.request("/user/alice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "online" }),
    })
    expect(res.status).toBe(304)
  })

  it("returns 400 for non-existent user", async () => {
    const app = makeApp()

    const res = await app.request("/user/ghost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "playing" }),
    })
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body.message).toContain("ghost")
  })

  it("returns 400 for invalid uid format", async () => {
    const app = makeApp()

    const res = await app.request("/user/a", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "playing" }),
    })
    expect(res.status).toBe(400)
  })

  it("returns 400 for invalid status value", async () => {
    const app = makeApp()
    await app.request("/user/alice")

    const res = await app.request("/user/alice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "invalid_status" }),
    })
    expect(res.status).toBe(400)
  })

  it("updates current_gid", async () => {
    const app = makeApp()
    await app.request("/user/alice")

    const res = await app.request("/user/alice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_gid: "abc1234567" }),
    })
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.data.current_gid).toBe("abc1234567")
  })

  it("rejects invalid current_gid format", async () => {
    const app = makeApp()
    await app.request("/user/alice")

    const res = await app.request("/user/alice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_gid: "short" }),
    })
    expect(res.status).toBe(400)
  })

  it("updates history", async () => {
    const app = makeApp()
    await app.request("/user/alice")

    const history = [
      {
        gid: "abc1234567",
        players: { Red: "alice", Black: "bob" },
        status: "finished",
        steps: [],
      },
    ]

    const res = await app.request("/user/alice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history }),
    })
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.data.history).toEqual(history)
  })

  it("returns 304 when history matches current state", async () => {
    const app = makeApp()
    await app.request("/user/alice")

    const res = await app.request("/user/alice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: [] }),
    })
    expect(res.status).toBe(304)
  })
})

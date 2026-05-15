import { Action } from "@hidess/shared"
import type Database from "better-sqlite3"
import type * as v from "valibot"
import { Utils } from "#/utils"
import type { VNanoId, VUserId } from "#/schema"
import type { VGameInfo, VGameSide, VGameStatus } from "./schema"

interface GameRecordRow {
  gid: VNanoId
  red_uid: VUserId
  black_uid: VUserId
  status: string
  steps: string
}

function rowToInfo(row: GameRecordRow) {
  return {
    gid: row.gid,
    players: { Red: row.red_uid, Black: row.black_uid } as VGameSide,
    status: row.status as VGameStatus,
    steps: JSON.parse(row.steps) as v.InferOutput<typeof Action>[],
  }
}

export function createGameStore(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_record (
      gid       TEXT PRIMARY KEY,
      red_uid   TEXT NOT NULL,
      black_uid TEXT NOT NULL,
      status    TEXT NOT NULL DEFAULT 'playing',
      steps     TEXT NOT NULL DEFAULT '[]'
    )
  `)

  const allGids = () => {
    const rows = db
      .prepare("SELECT gid FROM game_record")
      .all() as { gid: VNanoId }[]
    return new Set(rows.map((r) => r.gid))
  }

  return {
    get: (gid: VNanoId) => {
      const row = db
        .prepare("SELECT * FROM game_record WHERE gid = ?")
        .get(gid) as GameRecordRow | undefined
      if (!row) return null
      return rowToInfo(row)
    },

    getByUid: (uid: VUserId) => {
      const rows = db
        .prepare(
          "SELECT * FROM game_record WHERE red_uid = ? OR black_uid = ?",
        )
        .all(uid, uid) as GameRecordRow[]
      return rows.map(rowToInfo)
    },

    create: (players: VGameSide) => {
      const gid = Utils.generateId(allGids())
      db.prepare(
        "INSERT INTO game_record (gid, red_uid, black_uid) VALUES (?, ?, ?)",
      ).run(gid, players.Red, players.Black)
      return rowToInfo(
        db
          .prepare("SELECT * FROM game_record WHERE gid = ?")
          .get(gid) as GameRecordRow,
      )
    },

    update: (
      gid: VNanoId,
      patch: Partial<Pick<VGameInfo, "status" | "steps">>,
    ) => {
      const existing = db
        .prepare("SELECT * FROM game_record WHERE gid = ?")
        .get(gid) as GameRecordRow | undefined
      if (!existing) return { info: null, changed: false } as const

      const sets: string[] = []
      const values: unknown[] = []

      if (
        "status" in patch
        && patch.status !== undefined
        && patch.status !== existing.status
      ) {
        sets.push("status = ?")
        values.push(patch.status)
      }
      if (
        "steps" in patch
        && patch.steps !== undefined
        && JSON.stringify(patch.steps) !== existing.steps
      ) {
        sets.push("steps = ?")
        values.push(JSON.stringify(patch.steps))
      }

      if (sets.length === 0) {
        return { info: rowToInfo(existing), changed: false } as const
      }

      values.push(gid)
      db.prepare(
        `UPDATE game_record SET ${sets.join(", ")} WHERE gid = ?`,
      ).run(...values)

      const row = db
        .prepare("SELECT * FROM game_record WHERE gid = ?")
        .get(gid) as GameRecordRow

      return { info: rowToInfo(row), changed: true } as const
    },
  } as const
}

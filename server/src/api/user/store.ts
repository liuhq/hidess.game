import type Database from "better-sqlite3"
import type { VNanoId, VUserId } from "#/schema"
import type { VGameInfo, VUserInfo, VUserStatus } from "./schema"

interface UserProfileRow {
  uid: VUserId
  status: string
  current_gid: VNanoId | null
  history: string
}

function rowToInfo(row: UserProfileRow) {
  return {
    uid: row.uid,
    status: row.status as VUserStatus,
    current_gid: row.current_gid ?? undefined,
    history: JSON.parse(row.history) as VGameInfo[],
  }
}

export function createUserStore(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      uid          TEXT PRIMARY KEY,
      status       TEXT NOT NULL DEFAULT 'online',
      current_gid  TEXT,
      history      TEXT NOT NULL DEFAULT '[]'
    )
  `)

  return {
    get: (uid: VUserId) => {
      const row = db
        .prepare("SELECT * FROM user_profile WHERE uid = ?")
        .get(uid) as UserProfileRow | undefined
      if (!row) return null
      return rowToInfo(row)
    },

    create: (uid: VUserId) => {
      db.prepare("INSERT INTO user_profile (uid) VALUES (?)").run(uid)
      return rowToInfo(
        db
          .prepare("SELECT * FROM user_profile WHERE uid = ?")
          .get(uid) as UserProfileRow,
      )
    },

    update: (
      uid: VUserId,
      patch: Partial<
        Pick<VUserInfo, "status" | "current_gid" | "history">
      >,
    ) => {
      const existing = db
        .prepare("SELECT * FROM user_profile WHERE uid = ?")
        .get(uid) as UserProfileRow | undefined
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
        "current_gid" in patch
        && patch.current_gid !== undefined
        && patch.current_gid !== existing.current_gid
      ) {
        sets.push("current_gid = ?")
        values.push(patch.current_gid ?? null)
      }
      if (
        "history" in patch
        && patch.history !== undefined
        && JSON.stringify(patch.history) !== existing.history
      ) {
        sets.push("history = ?")
        values.push(JSON.stringify(patch.history))
      }

      if (sets.length === 0) {
        return { info: rowToInfo(existing), changed: false } as const
      }

      values.push(uid)
      db.prepare(
        `UPDATE user_profile SET ${sets.join(", ")} WHERE uid = ?`,
      ).run(...values)

      const row = db
        .prepare("SELECT * FROM user_profile WHERE uid = ?")
        .get(uid) as UserProfileRow

      return { info: rowToInfo(row), changed: true } as const
    },
  } as const
}

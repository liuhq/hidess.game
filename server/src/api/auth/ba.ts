import { db } from "#/db"
import { DEV_PORT } from "#/constants"
import { dash } from "@better-auth/infra"
import { betterAuth } from "better-auth"
import { getMigrations } from "better-auth/db/migration"

export const auth = betterAuth({
  appName: "Hidess Game",
  trustedOrigins: [
    "http://localhost:3000",
    "https://reshoot-catching-elude.ngrok-free.dev",
  ],
  baseURL: `http://localhost:${DEV_PORT}`,
  database: db,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [dash({ apiKey: process.env.BETTER_AUTH_API_KEY })],
})

const {
  toBeCreated,
  toBeAdded,
  runMigrations,
} = await getMigrations(auth.options)

if (toBeCreated.length !== 0 || toBeAdded.length !== 0) {
  await runMigrations()
}

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

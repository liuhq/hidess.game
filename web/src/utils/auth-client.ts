import { dashClient, sentinelClient } from "@better-auth/infra/client"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL,
  plugins: [
    dashClient(),
    sentinelClient(),
  ],
})

import { authClient } from "#/utils/auth-client"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

const Signin = () => {
  const [authInfo, setAuthInfo] = useState<{
    email: string
    passwd: string
  }>({
    email: "",
    passwd: "",
  })

  const handleSignin = async () => {
    const { data, error } = await authClient.signIn.email({
      email: authInfo.email,
      password: authInfo.passwd,
    })
  }

  return (
    <main>
      <ul>
        <li>
          <label>
            Email
            <input
              type="email"
              value={authInfo.email}
              onChange={(e) =>
                setAuthInfo((p) => ({ ...p, email: e.target.value }))}
            />
          </label>
        </li>
        <li>
          <label>
            Password
            <input
              value={authInfo.passwd}
              onChange={(e) =>
                setAuthInfo((p) => ({ ...p, passwd: e.target.value }))}
            />
          </label>
        </li>
      </ul>
      <button onClick={handleSignin}>Sign In</button>
    </main>
  )
}

export const Route = createFileRoute("/(sign)/signin")({
  component: Signin,
})

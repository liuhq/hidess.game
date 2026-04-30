import { authClient } from "#/utils/auth-client"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

const signup = () => {
  const [authInfo, setAuthInfo] = useState<{
    email: string
    passwd: string
  }>({
    email: "",
    passwd: "",
  })
  const [authError, setAuthError] = useState<string | null>()

  const handleSignup = async () => {
    const { data, error } = await authClient.signUp.email({
      name: authInfo.email,
      email: authInfo.email,
      password: authInfo.passwd,
    }, {
      onRequest: (c) => {},
      onSuccess: (c) => {},
      onError: (c) => {},
    })

    if (error) {
      setAuthError(error.message)
    }
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
      <button onClick={handleSignup}>Sign Up</button>
      {authError ?? <div>{authError}</div>}
    </main>
  )
}

export const Route = createFileRoute("/(sign)/signup")({
  component: signup,
})

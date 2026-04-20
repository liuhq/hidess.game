import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

const Start = () => {
  const [message, setMessage] = useState<string>("")

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const res = await fetch("/api/login", {
      method: "post",
      body: formData,
    })
    const resData: { message: string } = await res.json()

    setMessage(resData.message)
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input name="login" />
        <button type="submit">Login</button>
      </form>
      <h1>{message}</h1>
    </main>
  )
}

export const Route = createFileRoute("/start")({
  component: Start,
})

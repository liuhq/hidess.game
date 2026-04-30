import { createFileRoute } from "@tanstack/react-router"
import useSWRSubscription, {
  type SWRSubscriptionOptions,
} from "swr/subscription"

const gid = "abcdef1234"

const App = () => {
  const uid = "alex"
  const { data, error } = useSWRSubscription(
    () => `/ws?uid=${uid}`,
    (key, { next }: SWRSubscriptionOptions<string, Error>) => {
      const socket = new WebSocket(key)
      socket.addEventListener(
        "open",
        () => socket.send(`[client] ${uid}/${gid}`),
      )
      socket.addEventListener("message", (evt) => next(null, evt.data))
      socket.addEventListener(
        "error",
        (evt) => next(new Error(`WebSocket error: ${evt}`)),
      )
      return () => socket.close()
    },
  )

  if (error) {
    return <div>failed to load</div>
  }
  if (!data) {
    return <div>loading...</div>
  }

  return (
    <main className="">
      <div>{data}</div>
    </main>
  )
}

export const Route = createFileRoute("/")({ component: App })

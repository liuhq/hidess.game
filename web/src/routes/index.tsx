import { useGetApiRoomByRid } from "#/api/room/room"
import { createFileRoute } from "@tanstack/react-router"
import useSWRSubscription, {
  type SWRSubscriptionOptions,
} from "swr/subscription"

const rid = "room123456"
const gid = "abcdef1234"

const App = () => {
  const { data, error, isLoading } = useGetApiRoomByRid(rid)
  const { data: wsData, error: wsError } = useSWRSubscription(
    () => `/ws/${rid}/game/${gid}`,
    (key, { next }: SWRSubscriptionOptions<string, Error>) => {
      const socket = new WebSocket(key)
      socket.addEventListener(
        "open",
        () => socket.send(`[client] ${rid}/${gid}`),
      )
      socket.addEventListener("message", (evt) => next(null, evt.data))
      socket.addEventListener(
        "error",
        (evt) => next(new Error(`WebSocket error: ${evt}`)),
      )
      return () => socket.close()
    },
  )

  if (error || wsError) return <div>failed to load</div>
  if (isLoading || !wsData) return <div>loading...</div>

  return (
    <main className="">
      <div>{data?.player.join("++")}</div>
      <div>{wsData}</div>
    </main>
  )
}

export const Route = createFileRoute("/")({ component: App })

import Board from "#/components/Board"
import { createFileRoute } from "@tanstack/react-router"

const Go = () => {
  return (
    <main>
      <Board />
    </main>
  )
}

export const Route = createFileRoute("/go")({
  component: Go,
})

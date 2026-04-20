import { createFileRoute } from "@tanstack/react-router"

const About = () => {
  return <main>About</main>
}

export const Route = createFileRoute("/about")({
  component: About,
})

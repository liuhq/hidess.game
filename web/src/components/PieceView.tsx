import tw from "#/utils/tw"
import type { Piece, Side } from "@hidess/shared"

interface PieceProps extends Piece {
}

const colIndex = [
  "piece-col-0",
  "piece-col-1",
  "piece-col-2",
  "piece-col-3",
  "piece-col-4",
  "piece-col-5",
  "piece-col-6",
  "piece-col-7",
]

const rowIndex = [
  "piece-row-0",
  "piece-row-1",
  "piece-row-2",
  "piece-row-3",
]

const sideStyle: { [s in Side]: string } = {
  Black: "text-piece-self",
  Red: "text-piece-enemy",
}

export default function PieceView({ position: [col, row], side }: PieceProps) {
  const style = tw(
    "pointer-events-none",
    "transition-all",
    "absolute",
    "w-piece-size h-piece-size rounded-full",
    "bg-piece",
    sideStyle[side],
    colIndex[col] ?? false,
    rowIndex[row] ?? false,
  )

  return (
    <div
      className={style}
    >
      {side}
    </div>
  )
}

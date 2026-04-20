import { type GameState, Piece, Rule, Vec2 } from "@hidess/shared"
import { useState } from "react"
import PieceView from "./PieceView"
import Square from "./Square"

const mockSquare = Array.from(
  { length: 8 },
  (_, col) => Array.from({ length: 4 }, (_, row) => [col, row]),
).flatMap((row) => row) as [Vec2]

const mockPiece: Piece[] = [
  {
    pid: Piece.generatePid([0, 0]),
    kind: "Soldier",
    side: "Black",
    state: "Active",
    position: [0, 0],
  },
  {
    pid: Piece.generatePid([0, 2]),
    kind: "Soldier",
    side: "Red",
    state: "Active",
    position: [0, 2],
  },
  {
    pid: Piece.generatePid([2, 3]),
    kind: "Soldier",
    side: "Red",
    state: "Active",
    position: [2, 3],
  },
]

const isprimarySquare = ([col, row]: Vec2) => ((col + row) & 1) === 0

export default function Board() {
  const [game, setGame] = useState<GameState>({
    pieces: mockPiece,
    selectedPid: null,
    turn: "Black",
  })

  const selectedPiece = game.pieces.find((p) => p.pid === game.selectedPid)
    ?? null

  const validActions = selectedPiece
    ? Rule.getValidActions(game, selectedPiece.pid)
    : []

  const onSquareClick = (pos: Vec2) => {
    setGame((prev) => Rule.resolveSquareClick(prev, pos))
  }

  return (
    <div className="w-board-w h-board-h m-4 relative">
      <div>
        {game.pieces.map((p) => (
          <PieceView
            pid={p.pid}
            position={p.position}
            kind={p.kind}
            side={p.side}
            state={p.state}
            key={p.pid}
          />
        ))}
      </div>

      <div className="gap-square-gap grid grid-flow-col
                     grid-cols-(--grid-count-col) grid-rows-(--grid-count-row)
                     place-content-center place-items-center">
        {mockSquare.map((sp) => {
          const isSelected = !!selectedPiece
            && Vec2.eq(selectedPiece.position, sp)
          const action = validActions.find((a) =>
            "to" in a ? Vec2.eq(a.to, sp) : false
          )
          const isReachable = !!action && action.type === "move"
          const isAttackable = !!action && action.type === "capture"

          return (
            <Square
              squareType={isprimarySquare(sp) ? "primary" : "secondary"}
              squarePos={sp}
              isSelected={isSelected}
              isReachable={isReachable}
              isAttackable={isAttackable}
              onClick={onSquareClick}
              key={Vec2.toString(sp)}
            />
          )
        })}
      </div>
    </div>
  )
}

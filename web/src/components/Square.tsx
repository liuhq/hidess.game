import tw from "#/utils/tw"
import type { Vec2 } from "@hidess/shared"

interface SquareProps {
  squareType: "primary" | "secondary"
  squarePos: Vec2
  isSelected: boolean
  isReachable: boolean
  isAttackable: boolean
  onClick: (pos: Vec2) => void
}

export default function Square(
  {
    squareType,
    squarePos,
    isSelected,
    isReachable,
    isAttackable,
    onClick,
  }: SquareProps,
) {
  const styleType = {
    primary: "bg-square-primary",
    secondary: "bg-square-secondary",
  } as const
  const style = tw(
    "w-square-size h-square-size",
    styleType[squareType],
    isSelected && "border border-accent",
    isReachable && "ring-1 ring-piece-self",
    isAttackable && "ring-1 ring-piece-enemy",
  )

  return <div className={style} onClick={() => onClick(squarePos)}></div>
}

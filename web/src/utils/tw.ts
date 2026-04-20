export default function tw(...className: (string | false)[]) {
  return className.filter(Boolean).map((c) => (c as string).trim()).join(" ")
}

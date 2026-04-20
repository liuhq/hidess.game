import * as esbuild from "esbuild"

const COLOR = process.env.DISABLE_COLOR !== "1"
const ANALYZE = process.env.ANALYZE === "1"
const VERBOSE = process.env.VERBOSE === "1"

const result = await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: ["node25"],
  format: "esm",
  outdir: "dist",
  treeShaking: true,
  minify: true,
  metafile: ANALYZE,
  color: COLOR,
})

// https://esbuild.github.io/analyze/
if (ANALYZE) {
  const metafile = result.metafile
  if (!metafile) process.exit(1)

  const analyzed = await esbuild.analyzeMetafile(metafile, {
    color: COLOR,
    verbose: VERBOSE,
  })

  console.info(analyzed)
}

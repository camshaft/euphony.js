import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import babel from 'rollup-plugin-babel'
import external from 'rollup-plugin-auto-external'
const packagePath = require.resolve(`${process.cwd()}/package.json`)
const pkg = require(packagePath)
const deps = new Set(
  Object.keys(pkg.dependencies || {})
  .concat(Object.keys(pkg.devDependencies || {}))
)
export default ({ input = 'src/index.ts', output = 'build/index' }) => ({
  input,
  output: [
    {
      file: `${output}.mjs`,
      format: 'es'
    },
    {
      file: `${output}.js`,
      format: 'cjs',
      exports: 'named'
    }
  ],
  external: id => (
    deps.has(id) || id.includes('babel-runtime')
  ),
  plugins: [
    external({
      packagePath
    }),
    typescript({
      declarationDir: require('path').dirname(output),
      exclude: input.indexOf('test/') === 0 ?
        undefined :
        ['test/*']
    }),
    babel({
      runtimeHelpers: true
    }),

    nodeResolve({
      jsnext: true,
      main: true,
    }),

    commonjs({
      include: 'node_modules/**'
    }),
  ]
})

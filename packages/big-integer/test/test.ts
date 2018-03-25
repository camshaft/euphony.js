import { test } from 'ava'
import { check, gen } from 'ava-testcheck'
import { Decimal } from 'decimal.js'
import BigInteger from '../src/index'

const enum Ops {
  add = 'add',
  sub = 'sub',
  mul = 'mul',
  div = 'div',
  mod = 'mod'
}

const validOps = [
  Ops.add,
  Ops.sub,
  Ops.mul,
  Ops.div,
  // Ops.mod
]

test('decimal.js oracle', check(gen.int, gen.array(gen.array([gen.int, gen.oneOf(validOps)])), (t, initial, ops) => {
  let expected = new Decimal(initial)
  let actual = new BigInteger(initial)
  t.true(+expected.valueOf() === actual.valueOf())

  ops.forEach(([v, op]: [number, Ops]) => {
    if (v === 0 && op === 'div') return
    expected = expected[op](v).floor()
    actual = actual[op](v)
  })

  const tolerance = Math.pow(ops.length, 2)

  const converted = new Decimal(actual.toString())

  t.true(expected.sub(converted).lte(tolerance))
}))

// function euclidOracle(a: BigInteger, b: BigInteger): BigInteger {
//   while (true) {
//     if (a.iszero()) return b
//     b = a.mod(b)
//     if (b.iszero()) return a
//     a = b.mod(a)
//   }
// }

// const bigNumbers = gen.array(gen.posInt)

// test('euclidOracle', check(bigNumbers, bigNumbers, (t, a, b) => {
//   const x = new BigInteger(a.join('') || 0)
//   const y = new BigInteger(b.join('') || 0)
//   console.log(x.toString(), y.toString())
//   const expected = euclidOracle(x, y)
//   const actual = new BigInteger(x).gcd(y)

//   t.true(expected.eq(actual))
// }))

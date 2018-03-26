import { test } from 'ava'
import { check, gen } from 'ava-testcheck'
import { Decimal } from 'decimal.js'
import { Rational } from '../src/index'

const enum Ops {
  add = 'add',
  sub = 'sub',
  mul = 'mul',
  div = 'div'
}

const validOps = [Ops.add, Ops.sub, Ops.mul, Ops.div]

const opType = gen.array(gen.array([
  gen.array([gen.int, gen.sPosInt]),
  gen.oneOf(validOps)
]))

test('decimal.js oracle', check(opType, (t, ops) => {
  let expected = new Decimal(0)
  let actual = new Rational(0)
  t.true(+expected.valueOf() === actual.valueOf())

  ops.forEach(([[n, d], op]: [[number, number], Ops]) => {
    if (n === 0 && op === 'div') return
    expected = expected[op](new Decimal(n).div(d))
    actual = actual[op]([n, d])
  })

  const converted = new Decimal(actual.n.toString()).div(actual.d.toString())

  t.true(expected.sub(converted).abs().lt(1))

  // Test that valueOf works for large ratios
  actual.valueOf()
}))

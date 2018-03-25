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

test('decimal.js oracle', check(gen.array(gen.array([gen.int, gen.oneOf(validOps)])), (t, ops) => {
  let expected = new Decimal(0)
  let actual = new Rational(0, false)
  t.true(+expected.valueOf() === actual.valueOf())

  ops.forEach(([v, op]: [number, Ops]) => {
    if (v === 0 && op === 'div') return
    expected = expected[op](v)
    actual = actual[op](v)
  })

  const converted = new Decimal(actual.n.toString()).div(actual.d.toString())

  t.true(expected.sub(converted).abs().lte(Math.pow(ops.length, 3)))
}))

import { test } from 'ava'
import { check, gen } from 'ava-testcheck'
import { Decimal } from 'decimal.js'
import { BigInteger } from '../src/index'

const enum Ops {
  add = 'add',
  sub = 'sub',
  mul = 'mul',
  div = 'div'
}

const validOps = [Ops.add, Ops.sub, Ops.mul, Ops.div]

test('decimal.js oracle', check(gen.array(gen.array([gen.int, gen.oneOf(validOps)])), (t, ops) => {
  let expected = new Decimal(0)
  let actual = new BigInteger(0)
  t.true(+expected.valueOf() === actual.valueOf())

  ops.forEach(([v, op]: [number, Ops]) => {
    if (v === 0 && op === 'div') return
    expected = expected[op](v).floor()
    actual = actual[op](v)
  })

  t.true(+expected.valueOf() === actual.valueOf())
}))

function recursiveEuclid(a: number, b: number): number {
 if (b === 0) return a
 return recursiveEuclid(b, a % b)
}

test('recursiveEuclid', check(gen.posInt, gen.posInt, (t, a, b) => {
  t.true(new BigInteger(a).gcd(b).eq(recursiveEuclid(a, b)))
}))

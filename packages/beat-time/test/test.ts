import { test } from 'ava'
import { check, gen } from 'ava-testcheck'

test('check', check(gen.int, (t, i) => {
  t.true(typeof i === 'number')
}))

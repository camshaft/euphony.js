import { test } from 'ava'
import { check, gen } from 'ava-testcheck'
import { BeatTimecode } from '../src/index'
import { Timecode } from '@euphony/time'

test('ratio oracle', check(gen.intWithin(60, 250), (t, tempo) => {
  const BpMS = new Timecode(60000)
    .div(tempo)

  const base = new BeatTimecode(1, tempo)

  for (let i = 0; i < 100; ++i) {
    const actual = base.mul(i) as BeatTimecode
    const expected = BpMS.mul(i)

    t.true(actual.timecode.eq(expected))
  }
}))

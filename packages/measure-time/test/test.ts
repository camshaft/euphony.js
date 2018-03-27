import { test } from 'ava'
import { check, gen } from 'ava-testcheck'
import { MeasureTimecode, TimeSignature } from '../src/index'
import { BeatTimecode } from '@euphony/beat-time'
import { Timecode } from '@euphony/time'
import { Rational } from '@euphony/rational'

const tempos = gen.intWithin(40, 250)

const timeSignatures = gen.oneOf([
  gen.array([gen.intWithin(1, 16), 8]),
])

test('ratio oracle', check(tempos, timeSignatures, (t, tempo: number, ts: [number, number]) => {
  const timeSignature = new TimeSignature(ts)
  const BpMS = new Timecode(60000)
    .div(tempo)
    .div(ts[1])

  const base = new BeatTimecode([1, ts[1]], tempo)

  for (let i = 0; i < 100; ++i) {
    const actual = new MeasureTimecode(
      base.mul(i) as BeatTimecode,
      timeSignature
    )

    const measureRatio = new Rational([i, ts[0]])
    t.true(actual.eq(measureRatio))

    const { timecode, measure, beat } = actual

    const expected = BpMS.mul(i)
    t.true(timecode.eq(expected))

    const { div, mod } = measureRatio.divmod()
    t.true(measure.eq(div))
    t.true(beat.eq(mod))
  }
}))

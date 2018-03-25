import { Rational, RationalValue } from '@euphony/rational'
import { Timecode } from '@euphony/time'
import { ITime } from '@euphony/types'

const msInMinute = new Rational(60000)

export default class Beat extends Rational implements ITime { }

export { Beat }

export class BeatTimecode extends Beat implements ITime {
  public timecode: Timecode
  public tempo: Rational

  public static fromTimecodeTempo (timecode: Timecode, tempo: RationalValue) {
    const bigTempo = new Rational(tempo)
    const beatTimecode = new BeatTimecode(timecode.div(msInMinute.div(bigTempo)))
    beatTimecode.timecode = timecode
    beatTimecode.tempo = bigTempo
    return beatTimecode
  }

  public static epoch (timecode: Timecode, tempo: RationalValue): BeatTimecode {
    const beatTimecode = new BeatTimecode(0)
    beatTimecode.timecode = timecode
    beatTimecode.tempo = new Rational(tempo)
    return beatTimecode
  }

  public cmp (timecode: BeatTimecode): number {
    return this.timecode.cmp(timecode.timecode)
  }

  public add (value: BeatTimecode | RationalValue): BeatTimecode {
    const timecode = (value instanceof BeatTimecode) ? value : this.cast(value)
    const result = super.add(timecode) as BeatTimecode
    result.timecode = this.timecode.add(timecode.timecode)
    result.tempo = this.tempo
    return result
  }

  public sub (value: BeatTimecode | RationalValue): BeatTimecode {
    const timecode = (value instanceof BeatTimecode) ? value : this.cast(value)
    const result = super.sub(timecode) as BeatTimecode
    result.timecode = this.timecode.sub(timecode.timecode)
    result.tempo = this.tempo
    return result
  }

  public toTimecode (): Timecode {
    return this.timecode
  }

  protected cast (value: RationalValue): BeatTimecode {
    const { tempo } = this

    const timecode = new Timecode(
      msInMinute.div(tempo).mul(value)
    )

    return BeatTimecode.fromTimecodeTempo(timecode, tempo)
  }
}

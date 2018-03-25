import { Rational, RationalValue } from '@euphony/rational'
import { Timecode } from '@euphony/time'
import { ITime } from '@euphony/types'

const msInMinute = new Rational(60000)

export default class Beat extends Rational implements ITime { }

export { Beat }

export class BeatTimecode extends Beat implements ITime {
  public timecode: Timecode
  public tempo: Rational
  private bpms: Rational

  public static fromTimecodeTempo (timecode: Timecode, tempo: RationalValue) {
    const bigTempo = new Rational(tempo)
    const bpms = msInMinute.div(bigTempo)
    const beatTimecode = new BeatTimecode(timecode.div(bpms))
    beatTimecode.timecode = timecode
    beatTimecode.tempo = bigTempo
    beatTimecode.bpms = bpms
    return beatTimecode
  }

  public static epoch (timecode: Timecode, tempo: RationalValue): BeatTimecode {
    const beatTimecode = new BeatTimecode(0)
    beatTimecode.timecode = timecode
    const bigTempo = beatTimecode.tempo = new Rational(tempo)
    beatTimecode.bpms = msInMinute.div(bigTempo)
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
    result.bpms = this.bpms
    return result
  }

  public sub (value: BeatTimecode | RationalValue): BeatTimecode {
    const timecode = (value instanceof BeatTimecode) ? value : this.cast(value)
    const result = super.sub(timecode) as BeatTimecode
    result.timecode = this.timecode.sub(timecode.timecode)
    result.tempo = this.tempo
    result.bpms = this.bpms
    return result
  }

  public mul (value: BeatTimecode | RationalValue): BeatTimecode {
    const timecode = (value instanceof BeatTimecode) ? value : this.cast(value)
    const result = super.mul(timecode) as BeatTimecode
    result.timecode = this.timecode.mul(timecode.timecode)
    result.tempo = this.tempo
    result.bpms = this.bpms
    return result
  }

  public div (value: BeatTimecode | RationalValue): BeatTimecode {
    const timecode = (value instanceof BeatTimecode) ? value : this.cast(value)
    const result = super.div(timecode) as BeatTimecode
    result.timecode = this.timecode.div(timecode.timecode)
    result.tempo = this.tempo
    result.bpms = this.bpms
    return result
  }

  protected cast (value: RationalValue): BeatTimecode {
    const { bpms, tempo } = this

    const beatTimecode = new BeatTimecode(value)
    beatTimecode.timecode = new Timecode(bpms.mul(value))
    beatTimecode.tempo = tempo
    beatTimecode.bpms = bpms

    return beatTimecode
  }
}

import { Rational, RationalValue } from '@euphony/rational'
import { Beat, BeatTimecode } from '@euphony/beat-time'
import { Timecode } from '@euphony/time'
import { ITime } from '@euphony/types'

export default class Measure extends Rational implements ITime { }

export { Measure }

export class TimeSignature extends Rational {
  constructor(value: RationalValue) {
    super(value, false)
  }

  public simplify() {
    return super.simplify(false)
  }
}

export class MeasureTimecode extends Measure implements ITime {
  public beatTimecode: BeatTimecode
  public timeSignature: Rational
  protected _beat?: Beat
  protected _measure?: Measure

  public static fromBeatTimesignature (beatTimecode: BeatTimecode, timeSignature: TimeSignature): MeasureTimecode {
    const measureTimecode = new MeasureTimecode(beatTimecode.div(timeSignature))
    measureTimecode.timeSignature = timeSignature
    measureTimecode.beatTimecode = beatTimecode
    return measureTimecode
  }

  public static epoch (beatTimecode: BeatTimecode, timeSignature: TimeSignature): MeasureTimecode {
    const measureTimecode = new MeasureTimecode(0)
    measureTimecode.timeSignature = timeSignature
    measureTimecode.beatTimecode = beatTimecode
    return measureTimecode
  }

  public get timecode (): Timecode {
    return this.beatTimecode.timecode
  }

  public get beat (): Beat {
    if (this._beat === undefined) {
      this.computeMeasureBeat()
    }

    return this._beat as Beat
  }

  public get measure (): Measure {
    if (this._measure === undefined) {
      this.computeMeasureBeat()
    }

    return this._measure as Measure
  }

  protected computeMeasureBeat (): void {
    const { div, mod } = this.divmod()
    this._measure = new Measure(div)
    this._beat = new Beat(mod)
  }

  public cmp (measureTimecode: MeasureTimecode): number {
    return this.beatTimecode.cmp(measureTimecode.beatTimecode)
  }

  public add (value: MeasureTimecode | RationalValue): MeasureTimecode {
    const timecode = (value instanceof MeasureTimecode) ? value : this.cast(value)
    const result = super.add(timecode) as MeasureTimecode
    result.beatTimecode = this.beatTimecode.add(timecode.beatTimecode)
    result.timeSignature = this.timeSignature
    return result
  }

  public sub (value: MeasureTimecode | RationalValue): MeasureTimecode {
    const timecode = (value instanceof MeasureTimecode) ? value : this.cast(value)
    const result = super.sub(timecode) as MeasureTimecode
    result.beatTimecode = this.beatTimecode.sub(timecode.beatTimecode)
    result.timeSignature = this.timeSignature
    return result
  }

  public mul (value: MeasureTimecode | RationalValue): MeasureTimecode {
    const timecode = (value instanceof MeasureTimecode) ? value : this.cast(value)
    const result = super.mul(timecode) as MeasureTimecode
    result.beatTimecode = this.beatTimecode.mul(timecode.beatTimecode)
    result.timeSignature = this.timeSignature
    return result
  }

  public div (value: MeasureTimecode | RationalValue): MeasureTimecode {
    const timecode = (value instanceof MeasureTimecode) ? value : this.cast(value)
    const result = super.div(timecode) as MeasureTimecode
    result.beatTimecode = this.beatTimecode.div(timecode.beatTimecode)
    result.timeSignature = this.timeSignature
    return result
  }

  // public inspect() {
  //   return this.beatTimecode.inspect()
  // }

  protected cast (value: RationalValue): MeasureTimecode {
    const { timeSignature } = this

    const measureTimecode = new MeasureTimecode(value)
    measureTimecode.beatTimecode = new BeatTimecode(
      timeSignature.mul(value)
    )
    measureTimecode.timeSignature = timeSignature

    return measureTimecode
  }
}

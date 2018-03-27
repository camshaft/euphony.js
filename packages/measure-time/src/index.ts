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

  public simplify(): this {
    return this
  }
}

export type TimeSignatureValue = TimeSignature | [number, number]

export class MeasureTimecode extends Rational implements ITime {
  public offset: BeatTimecode
  public timeSignature: TimeSignature
  protected _beatTimecode: BeatTimecode
  protected _beat?: Beat
  protected _measure?: Measure

  constructor(
    value: BeatTimecode,
    timeSignature: TimeSignatureValue = [4, 4],
    offset: MeasureTimecode | BeatTimecode = new BeatTimecode(0, value.tempo),
    simplify: boolean = true
  ) {
    const ts = new TimeSignature(timeSignature)
    super(value.div(ts), simplify)
    this.timeSignature = ts
    this._beatTimecode = value
    this.offset = (offset instanceof MeasureTimecode) ?
      offset.offset :
      offset
  }

  public get beatTimecode (): BeatTimecode {
    let { _beatTimecode, offset } = this
    return _beatTimecode.add(offset)
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

  public cmp (value: RationalValue): number {
    return (value instanceof MeasureTimecode) ?
      this.timecode.cmp(value.timecode) : (
      (value instanceof BeatTimecode) ?
        this.beatTimecode.cmp(value) :
        super.cmp(value)
    )
  }

  protected cast (value: RationalValue, simplify: boolean): this {
    const { timeSignature, offset } = this
    if (value instanceof MeasureTimecode) {
      return new MeasureTimecode(
        value.beatTimecode,
        value.timeSignature,
        value.offset,
        simplify
      ) as this
    }
    if (value instanceof BeatTimecode) {
      return new MeasureTimecode(
        value,
        timeSignature,
        offset.add(value.offset),
        simplify
      ) as this
    }
    return new MeasureTimecode(
      new BeatTimecode(
        new Rational(value).mul(timeSignature),
        this.beatTimecode.tempo
      ),
      timeSignature,
      offset,
      simplify
    ) as this
  }
}

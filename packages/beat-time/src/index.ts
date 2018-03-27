import { Rational, RationalValue } from '@euphony/rational'
import { Timecode } from '@euphony/time'
import { ITime } from '@euphony/types'

const msInMinute = new Timecode(60000)

export default class Beat extends Rational implements ITime { }

export { Beat }

export class BeatTimecode extends Beat implements ITime {
  public offset: Timecode
  public tempo: Rational
  protected _timecode?: Timecode

  constructor(
    value: RationalValue,
    tempo: RationalValue = 120,
    offset: BeatTimecode | Timecode = new Timecode(0),
    simplify: boolean = true
  ) {
    super(value, simplify)
    this.tempo = new Rational(tempo)
    this.offset = (offset instanceof BeatTimecode) ?
      offset.timecode :
      offset
  }

  public get timecode (): Timecode {
    let { _timecode } = this
    if (_timecode === undefined) {
      const { tempo } = this
      _timecode = this._timecode = msInMinute.div(tempo).mul(this)
    }
    return _timecode.add(this.offset)
  }

  public cmp (value: RationalValue): number {
    return (value instanceof BeatTimecode) ?
      this.timecode.cmp(value.timecode) :
      super.cmp(value)
  }

  protected cast (value: RationalValue, simplify: boolean): BeatTimecode {
    const { tempo, offset } = this
    if (value instanceof BeatTimecode) {
      return new BeatTimecode(
        value,
        tempo,
        offset.add(value.offset),
        simplify
      )
    }
    return new BeatTimecode(
      value,
      tempo,
      offset,
      simplify
    )
  }
}

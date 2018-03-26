import { IClock, ITimer } from '@euphony/types'
import { Time, Timecode } from '@euphony/time'
import { now } from '@euphony/now'

export interface Timeout { }

export default class BufferedClockTimer implements IClock<Timecode>, ITimer<Timecode> {
  protected buffer: number
  protected timecode?: Timecode
  protected initialOffset: Timecode
  private offset?: Timecode

  constructor (offset: Timecode = new Timecode(0), buffer: Time = new Time(10)) {
    this.buffer = Math.floor(buffer.valueOf())
    this.initialOffset = this.timecode = this._now().add(offset).simplify(true)
  }

  public now (time?: Timecode): Timecode {
    const { timecode } = this
    if (timecode !== undefined) return timecode

    if (time == undefined) {
      time = this._now()
    }

    let { offset } = this
    if (offset === undefined) {
      const { buffer, initialOffset } = this
      offset = this.offset = initialOffset.add(buffer).sub(time).simplify(true)
    }

    return offset.add(time)
  }

  public setTimeout (handle: () => void, time: Time): Timeout {
    const { buffer } = this
    const start = this._now()
    const timecode = this.now(start)
    const target = Math.floor(Math.max(
      time.sub(buffer).valueOf(),
      buffer,
      0
    ))

    return setTimeout(() => {
      this.buffer = Math.ceil(
        this._now().sub(start).valueOf()
      ) - target
      this.timecode = timecode.add(time)
      handle()
      this.timecode = undefined
    }, target)
  }

  public clearTimeout (id: Timeout): void {
    clearTimeout(id as { ref(): void, unref(): void })
  }

  protected _now (): Timecode {
    return now()
  }
}

export { BufferedClockTimer }

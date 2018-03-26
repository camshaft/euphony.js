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
    this.initialOffset = this.timecode = offset.add(this._now())
  }

  public now (time?: number): Timecode {
    const { timecode } = this
    if (timecode !== undefined) {
      return timecode
    } else {
      if (time == undefined) {
        time = this._now()
      }

      const { offset } = this
      if (offset === undefined) {
        return this.offset = this.initialOffset.sub(time)
      } else {
        return offset.add(time)
      }
    }
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
      const end = this._now()
      this.buffer = Math.floor(end - start - target)
      this.timecode = timecode.add(time)
      handle()
      this.timecode = undefined
    }, target)
  }

  public clearTimeout (id: Timeout): void {
    clearTimeout(id as { ref(): void, unref(): void })
  }

  protected _now (): number {
    return Math.floor(now())
  }
}

export { BufferedClockTimer }

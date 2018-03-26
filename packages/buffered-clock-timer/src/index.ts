import { IClock, ITimer } from '@euphony/types'
import { Time, Timecode } from '@euphony/time'

export interface Timer {
  ref (): void
  unref (): void
}

export default class BufferedClockTimer implements IClock<Timecode>, ITimer<Timecode> {
  protected buffer: Time
  protected timecode: Timecode

  constructor (buffer: Time = new Time(10)) {
    this.buffer = buffer
    this.timecode = new Timecode(0)
  }

  public now (): Timecode {
    return this.timecode
  }

  public setTimeout (handle: () => void, time: Time): Timer {
    const timecode = this.timecode.add(time)
    const target = time.sub(this.buffer).valueOf()
    return setTimeout(() => {
      this.timecode = timecode
      handle()
    }, target)
  }

  public clearTimeout (id: Timer) {
    clearTimeout(id)
  }
}

export { BufferedClockTimer }

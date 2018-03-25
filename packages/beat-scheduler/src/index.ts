import { Beat, BeatTimecode } from '@euphony/beat-time'
import { Rational } from '@euphony/rational'
import { Timecode } from '@euphony/time'
import { IParentScheduler, IScheduledTask, ITask } from '@euphony/types'
import { SkewableTask } from '@euphony/skewable-task'

export interface IBeatSchedulerOpts {
  tempo?: number
  numerator?: number
  denominator?: number
}

export class BeatTask extends SkewableTask<Beat, BeatTimecode, Timecode> {
  protected toRootTimecode(timecode: BeatTimecode): Timecode {
    return timecode.toTimecode()
  }
}

export default class BeatScheduler implements IParentScheduler<Beat, BeatTimecode, Timecode> {
  public scheduler: IParentScheduler<Timecode, Timecode, Timecode>
  protected _tempo: number
  protected epoch: BeatTimecode

  constructor (
    tempo: number,
    scheduler: IParentScheduler<Timecode, Timecode, Timecode>
  ) {
    this.scheduler = scheduler
    this._tempo = tempo
    this.epoch = BeatTimecode.epoch(scheduler.currentTime(), tempo)
  }

  get tempo () {
    return this._tempo
  }

  set tempo (tempo: number) {
    if (tempo === this._tempo) return
    const epoch = this.epoch = this.currentTime()
    epoch.tempo = new Rational(this._tempo = tempo)
    this.reschedule(epoch)
  }

  public currentTime (): BeatTimecode {
    const {
      _tempo,
      scheduler,
      epoch
    } = this

    const time = scheduler.currentTime().sub(epoch.timecode)

    const timecode = BeatTimecode.fromTimecodeTempo(time, _tempo)
    return timecode.add(epoch)
  }

  public scheduleTask (
    localOffset: Beat | number | string,
    delay: Beat | number | string,
    period: Beat | number | string | null,
    task: ITask<BeatTimecode>
  ): IScheduledTask<Timecode> {
    if (period !== null) period = new Beat(period)

    const st = new BeatTask(
      this.currentTime(),
      new Beat(delay),
      new Beat(localOffset),
      period,
      task,
      this
    )
    this.scheduler.addScheduledTask(st)

    return st
  }

  public addScheduledTask (st: IScheduledTask<Timecode>) {
    this.scheduler.addScheduledTask(st)
  }

  public relative (offset: Beat) {
    const scheduler = new BeatScheduler(this._tempo, this.scheduler)
    // TODO i don't think this is correct - fix it
    scheduler.epoch = this.epoch.add(offset)

    return scheduler
  }

  public cancel (task: IScheduledTask<any>) {
    this.scheduler.cancel(task)
  }

  public cancelAll (f: (task: IScheduledTask<any>) => boolean) {
    this.scheduler.cancelAll(f)
  }

  protected reschedule (epoch: BeatTimecode) {
    const tasks: BeatTask[] = []

    this.cancelAll((task: IScheduledTask<any>) => {
      if (!(task instanceof BeatTask)) return false
      if (task.scheduler !== this) return false
      task.skew(epoch)
      if (task.active) tasks.push(task)
      return true
    })

    for (const task of tasks) {
      this.addScheduledTask(task)
    }
  }
}

export { BeatScheduler }

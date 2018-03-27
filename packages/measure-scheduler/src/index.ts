import { Measure, MeasureTimecode, TimeSignature } from '@euphony/measure-time'
import { RationalValue } from '@euphony/rational'
import { Beat, BeatTimecode } from '@euphony/beat-time'
import { Timecode } from '@euphony/time'
import { IParentScheduler, IScheduledTask, ITask } from '@euphony/types'
import { SkewableTask } from '@euphony/skewable-task'

export class MeasureTask extends SkewableTask<Measure, MeasureTimecode, Timecode> {
  protected toRootTimecode(measure: MeasureTimecode): Timecode {
    return measure.timecode
  }
}

export default class MeasureScheduler implements IParentScheduler<Measure, MeasureTimecode, Timecode> {
  public scheduler: IParentScheduler<Beat, BeatTimecode, Timecode>
  protected _timeSignature: TimeSignature
  protected epoch: MeasureTimecode

  constructor (
    timeSignature: TimeSignature | [number, number],
    scheduler: IParentScheduler<Beat, BeatTimecode, Timecode>
  ) {
    this.scheduler = scheduler
    timeSignature = new TimeSignature(timeSignature)
    this._timeSignature = timeSignature
    this.epoch = new MeasureTimecode(
      scheduler.currentTime(),
      timeSignature
    )
  }

  get timeSignature () {
    return this._timeSignature
  }

  set timeSignature (timeSignature: TimeSignature | [number, number]) {
    timeSignature = new TimeSignature(timeSignature)
    if (timeSignature.eq(this._timeSignature)) return
    const epoch = this.epoch = this.currentTime()
    this._timeSignature = timeSignature
    this.reschedule(epoch)
  }

  public currentTime (): MeasureTimecode {
    const {
      _timeSignature,
      scheduler,
      epoch
    } = this

    const time = scheduler.currentTime().sub(epoch.beatTimecode) as BeatTimecode

    return new MeasureTimecode(time, _timeSignature, epoch)
  }

  public scheduleTask (
    localOffset: Measure | Beat | RationalValue,
    delay: Measure | Beat | RationalValue,
    period: Measure | Beat | RationalValue | null,
    task: ITask<MeasureTimecode>
  ): IScheduledTask<Timecode> {
    const { _timeSignature } = this

    if (localOffset instanceof Beat) localOffset = localOffset.div(_timeSignature)
    if (delay instanceof Beat) delay = delay.div(_timeSignature)
    if (period instanceof Beat) period = period.div(_timeSignature)

    if (period !== null) period = new Measure(period)

    const st = new MeasureTask(
      this.currentTime(),
      new Measure(delay),
      new Measure(localOffset),
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

  public relative (offset: Measure) {
    const scheduler = new MeasureScheduler(this._timeSignature, this.scheduler)
    // TODO i don't think this is correct - fix it
    scheduler.epoch = this.epoch.add(offset) as MeasureTimecode

    return scheduler
  }

  public cancel (task: IScheduledTask<any>) {
    this.scheduler.cancel(task)
  }

  public cancelAll (f: (task: IScheduledTask<any>) => boolean) {
    this.scheduler.cancelAll(f)
  }

  protected reschedule (epoch: MeasureTimecode) {
    const tasks: MeasureTask[] = []

    this.cancelAll((task: IScheduledTask<any>) => {
      if (!(task instanceof MeasureTask)) return false
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

export { MeasureScheduler }

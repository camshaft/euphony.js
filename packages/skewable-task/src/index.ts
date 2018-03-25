import { IScheduledTask, IScheduler, ITask, ITime } from '@euphony/types'

export default abstract class SkewableTask<Time extends ITime, Timecode extends ITime, RootTimecode extends ITime>
    implements IScheduledTask<RootTimecode> {
  public time: RootTimecode
  public active: boolean = true
  public scheduler: IScheduler<Time, Timecode>
  protected startTime: Timecode
  protected delay: Time
  protected scheduledTime: Timecode
  protected task: ITask<Timecode>
  protected localOffset: Time
  protected period: Time | null

  constructor (
    startTime: Timecode,
    delay: Time,
    localOffset: Time,
    period: Time | null,
    task: ITask<Timecode>,
    scheduler: IScheduler<Time, Timecode>
  ) {
    const scheduledTime = startTime.add(delay)
    this.time = this.toRootTimecode(scheduledTime)
    this.scheduler = scheduler

    this.startTime = startTime
    this.delay = delay
    this.scheduledTime = scheduledTime
    this.task = task
    this.localOffset = localOffset
    this.period = period
  }

  public nextPeriod (): boolean {
    const { period, scheduler } = this
    if (period === null) return false

    this.delay = period
    const currentTime = this.startTime = scheduler.currentTime()
    const scheduledTime = this.scheduledTime = currentTime.add(period)
    this.time = this.toRootTimecode(scheduledTime)

    return true
  }

  public run (): void {
    this.task.run(this.scheduledTime.add(this.localOffset))
  }

  public error (e: Error): void {
    this.task.error(this.scheduledTime.add(this.localOffset), e)
  }

  public dispose (): void {
    this.scheduler.cancel(this)
    this.task.dispose()
  }

  public skew (newEpoch: Timecode): void {
    const { startTime } = this
    const timePassed = newEpoch.sub(startTime)
    const delay = this.delay = this.delay.sub(timePassed)
    this.startTime = newEpoch
    const scheduledTime = this.scheduledTime = newEpoch.add(delay)
    this.time = this.toRootTimecode(scheduledTime)

    // because the epoch changed we missed the original time
    if (scheduledTime.cmp(newEpoch) < 0) {
      const { period } = this
      if (period !== null) {
        this.delay = period
        this.skew(scheduledTime)
      } else {
        this.task.dispose()
        this.active = false
      }
    }
  }

  protected abstract toRootTimecode(timecode: Timecode): RootTimecode
}

export { SkewableTask }

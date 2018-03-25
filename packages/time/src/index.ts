import { Rational } from '@euphony/rational'
import { ITime } from '@euphony/types'

export default class Time extends Rational implements ITime { }

export { Time, Time as Timecode }

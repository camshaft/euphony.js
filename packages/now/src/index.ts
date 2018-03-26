import { Timecode } from '@euphony/time'

const sToNs = 1e9
const nsToMs = new Timecode(1, false).div(1e6)

export function now (): Timecode {
  const [s, ns] = process.hrtime()
  return nsToMs.mul(s * sToNs + ns)
}

export { now as default }

export function now (): number {
  const [s, ns] = process.hrtime()
  return s * 1e3 + ns / 1e6
}

export { now as default }

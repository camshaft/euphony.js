const performance = (global as any).performance || {};

const now = (
  performance.now ||
  performance.webkitNow ||
  performance.msNow ||
  performance.mozNow ||
  performance.oNow ||
  (() => {
    const dateNow = Date.now || (() => new Date().getTime())
    const navigationStart = (performance.timing || {}).navigationStart || dateNow()
    return () => dateNow() - navigationStart
  })()
).bind(performance)

export {
  now,
  now as default
}

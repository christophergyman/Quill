type LogMethod = (message: string, ...args: unknown[]) => void

interface RendererLogger {
  debug: LogMethod
  info: LogMethod
  warn: LogMethod
  error: LogMethod
}

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV

export function createRendererLogger(name: string): RendererLogger {
  const prefix = `[${name}]`

  return {
    debug: isDev ? (msg, ...args) => console.debug(prefix, msg, ...args) : () => {},
    info: (msg, ...args) => console.info(prefix, msg, ...args),
    warn: (msg, ...args) => console.warn(prefix, msg, ...args),
    error: (msg, ...args) => console.error(prefix, msg, ...args)
  }
}

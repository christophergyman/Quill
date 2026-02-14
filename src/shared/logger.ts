import pino from 'pino'
import type { LoggerOptions } from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

let logFilePath: string | null = null

/**
 * Set the log file path for production file transport.
 * Must be called before creating loggers in production.
 */
export function setLogFilePath(path: string) {
  logFilePath = path
}

export function createLogger(name: string) {
  const options: LoggerOptions = {
    name,
    level: isDev ? 'debug' : 'info'
  }

  if (isDev) {
    return pino({
      ...options,
      transport: {
        target: 'pino-pretty',
        options: { colorize: true }
      }
    })
  }

  if (logFilePath) {
    return pino(options, pino.destination({ dest: logFilePath, mkdir: true, sync: false }))
  }

  return pino(options)
}

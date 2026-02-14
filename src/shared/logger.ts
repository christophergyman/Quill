import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

export function createLogger(name: string) {
  return pino({
    name,
    level: isDev ? 'debug' : 'info',
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: { colorize: true }
        }
      : undefined
  })
}

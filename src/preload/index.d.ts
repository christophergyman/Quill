import type { QuillAPI } from './index'

declare global {
  interface Window {
    api: QuillAPI
  }
}

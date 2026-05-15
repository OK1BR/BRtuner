import { ElectronAPI } from '@electron-toolkit/preload'

export interface TunerAPI {
  getUrl: () => Promise<string | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    tuner: TunerAPI
  }
}

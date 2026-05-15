import { useEffect, useRef, useState } from 'react'

type WebviewElement = HTMLElement & {
  reload: () => void
  src: string
  insertCSS: (css: string) => Promise<string>
}

const TUNER_CSS_OVERRIDES = `
  html, body {
    overflow: hidden !important;
  }
  body {
    background-color: #202020 !important;
    background-image: none !important;
  }
  .container {
    background-color: #202020 !important;
  }
  ::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
`

function GearIcon(): React.JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function App(): React.JSX.Element {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const webviewRef = useRef<WebviewElement | null>(null)

  useEffect(() => {
    void window.tuner.getUrl().then((u) => {
      if (!u) {
        setError('No tuner.config.local.json found — create one from the example file')
        return
      }
      setUrl(u)
    })
  }, [])

  useEffect(() => {
    if (!url) return
    const wv = webviewRef.current
    if (!wv) return

    const onFail = (e: Event): void => {
      const evt = e as Event & { errorDescription?: string }
      setError(evt.errorDescription ?? 'Failed to load')
    }
    const onDomReady = (): void => {
      void wv.insertCSS(TUNER_CSS_OVERRIDES)
    }

    wv.addEventListener('did-fail-load', onFail)
    wv.addEventListener('dom-ready', onDomReady)
    return () => {
      wv.removeEventListener('did-fail-load', onFail)
      wv.removeEventListener('dom-ready', onDomReady)
    }
  }, [url])

  const onSettings = (): void => {
    // TODO: open settings dialog
    console.log('Settings clicked')
  }

  return (
    <div className="app">
      <header className="titlebar">
        <div className="titlebar-actions">
          <button className="titlebar-btn" onClick={onSettings} title="Settings">
            <GearIcon />
          </button>
        </div>
      </header>
      <main className="content">
        {error && (
          <div className="screen-msg">
            <div className="err">{error}</div>
          </div>
        )}
        {!error && !url && <div className="screen-msg">Loading…</div>}
        {!error && url && (
          <webview
            ref={webviewRef as never}
            src={url}
            className="tuner-webview"
            // @ts-expect-error — Electron-specific attribute
            allowpopups="true"
          />
        )}
      </main>
    </div>
  )
}

export default App

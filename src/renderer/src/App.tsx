import { useEffect, useRef, useState } from 'react'

type WebviewElement = HTMLElement & {
  reload: () => void
  src: string
}

function App(): React.JSX.Element {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
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

    const onStart = (): void => setLoading(true)
    const onStop = (): void => setLoading(false)
    const onFail = (e: Event): void => {
      setLoading(false)
      const evt = e as Event & { errorDescription?: string }
      setError(evt.errorDescription ?? 'Failed to load')
    }

    wv.addEventListener('did-start-loading', onStart)
    wv.addEventListener('did-stop-loading', onStop)
    wv.addEventListener('did-fail-load', onFail)
    return () => {
      wv.removeEventListener('did-start-loading', onStart)
      wv.removeEventListener('did-stop-loading', onStop)
      wv.removeEventListener('did-fail-load', onFail)
    }
  }, [url])

  const onReload = (): void => {
    setError(null)
    webviewRef.current?.reload()
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-name">BRtuner</span>
          <span className="brand-sub">{url ?? '—'}</span>
        </div>
        <div className="actions">
          <button className="btn" onClick={onReload} disabled={!url}>
            {loading ? 'Loading…' : 'Reload'}
          </button>
        </div>
      </header>

      <main className="content">
        {error && <div className="err">{error}</div>}
        {url && (
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

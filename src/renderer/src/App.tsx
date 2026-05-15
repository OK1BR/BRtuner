function App(): React.JSX.Element {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-name">BRtuner</span>
          <span className="brand-sub">Remote Antenna Tuner Control</span>
        </div>
        <div className="connection">
          <span className="conn-dot conn-dot--off" />
          <span className="conn-label">Disconnected</span>
        </div>
      </header>

      <main className="content">
        <div className="placeholder">
          <h2>Vítej v BRtuneru</h2>
          <p>Aplikace zatím není připojena k tuneru. Nastavení připojení doplníme později.</p>
        </div>
      </main>
    </div>
  )
}

export default App

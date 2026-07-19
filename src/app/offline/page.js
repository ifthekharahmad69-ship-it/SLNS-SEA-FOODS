export default function OfflinePage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>You're offline — SLNS Fresh Sea Foods</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0a1628;
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
          }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { font-size: 1.6rem; margin-bottom: 0.5rem; }
          p { color: rgba(255,255,255,0.65); margin-bottom: 1.5rem; font-size: 0.95rem; }
          button {
            background: #0f4c75;
            color: white;
            border: none;
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            font-weight: 600;
          }
          button:hover { background: #1a7abf; }
        `}</style>
      </head>
      <body>
        <div>
          <div className="icon">🦐</div>
          <h1>You're offline</h1>
          <p>
            No internet connection right now.<br />
            Check your connection and try again.
          </p>
          <button onClick={() => window.location.reload()}>
            🔄 Try Again
          </button>
        </div>
      </body>
    </html>
  );
}

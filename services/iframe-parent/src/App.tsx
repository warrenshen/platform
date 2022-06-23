import React, { useEffect } from 'react';
import './App.css';

const EmbedUrl = "http://localhost:3005";

function App() {
  useEffect(() => {
    window.addEventListener("message", (event) => {
      // Do we trust the sender of this message?  (might be
      // different from what we originally opened, for example).
      if (event.origin !== EmbedUrl) {
        return;
      }

      console.log("Received event from child via postMessage...");
      console.log(event.data);

      if (!!event.source) {
        (event.source as Window).postMessage({
          identifier: "heartbeat_response",
          payload: null,
        }, event.origin);
      }
    }, false);
  }, []);

  return (
    <div
      className="App"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <header className="App-header">
        <p>
          Simple demo website with Platform as an <code>iframe</code> embed.
        </p>
        <div style={{
          flex: 1,
          display: "flex",
          width: "100%",
        }}>
          <iframe
            id="bespoke-financial-iframe"
            title="Bespoke Financial"
            src={EmbedUrl}
            frameBorder="0"
            style={{
              overflow: 'hidden',
              width: '100%',
              flex: 1,
            }}
          ></iframe>
        </div>
      </header>
    </div>
  );
}

export default App;

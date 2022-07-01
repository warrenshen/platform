import React, { useEffect } from 'react';
import './App.css';

const ValidEmbedUrl = "http://localhost:3005";
// Global boolean to track if "message" event listener is already added.
// This is necessary since useEffect with an empty dependency array calls
// its callback twice in development environment in strict mode.
let IsEventListenerAdded = false;

export default function App() {
  useEffect(() => {
    if (IsEventListenerAdded) {
      return;
    } else {
      IsEventListenerAdded = true;
    }

    window.addEventListener("message", (event) => {
      // Do we trust the sender of this message?  (might be
      // different from what we originally opened, for example).
      if (event.origin !== ValidEmbedUrl) {
        return;
      }

      console.log("[iframe-parent] Received event from child via postMessage...", event.data);

      const processError = (errorMessage: string) => {
        console.info(`[iframe-parent] ${errorMessage}`);
        window.parent.postMessage(
          {
            identifier: "handshake_error",
            payload: {
              message: errorMessage,
            },
          },
          ValidEmbedUrl
        );
      };

      if (!event.source) {
        processError("Failed to process event due to missing source!");
        return;
      }

      const eventIdentifier = event.data.identifier;
      // const eventPayload = event.data.payload;
      if (!eventIdentifier) {
        processError("Failed to process event due to missing identifier!");
        return;
      }

      if (eventIdentifier === "handshake_request") {
        (event.source as Window).postMessage({
          identifier: "handshake_response",
          payload: {},
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
            src={ValidEmbedUrl}
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

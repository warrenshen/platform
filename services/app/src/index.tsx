import { CssBaseline } from "@material-ui/core";
import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom";
import ApolloWrapper from "./ApolloWrapper";
import App from "./App";
import CurrentUserWrapper from "./CurrentUserWrapper";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

Sentry.init({
  dsn: process.env.REACT_APP_BESPOKE_SENTRY_DNS,
  environment: process.env.NODE_ENV,
});

ReactDOM.render(
  <CurrentUserWrapper>
    <ApolloWrapper>
      <CssBaseline>
        <App />
      </CssBaseline>
    </ApolloWrapper>
  </CurrentUserWrapper>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

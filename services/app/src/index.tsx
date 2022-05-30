import "./index.css";

import { CssBaseline } from "@material-ui/core";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import * as Sentry from "@sentry/react";
import { SnackbarProvider } from "material-ui-snackbar-provider";
import ReactDOM from "react-dom";

import App from "./App";
import CustomSnackbar from "./components/Shared/Snackbar/CustomSnackbar";
import ApolloWrapper from "./contexts/ApolloClientProvider";
import CurrentUserProvider from "./contexts/CurrentUserProvider";
import reportWebVitals from "./reportWebVitals";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "rgba(118, 147, 98, 1.0)",
    },
    // secondary: {
    //   main: green[500],
    // },
  },
  typography: {
    fontFamily: ["Inter", "sans-serif"].join(","),
    button: {
      textTransform: "none",
    },
  },
});

Sentry.init({
  dsn: process.env.REACT_APP_BESPOKE_SENTRY_DNS,
  environment: process.env.NODE_ENV,
});

ReactDOM.render(
  <CurrentUserProvider>
    <ApolloWrapper>
      <ThemeProvider theme={theme}>
        <SnackbarProvider SnackbarComponent={CustomSnackbar}>
          <CssBaseline>
            <App />
          </CssBaseline>
        </SnackbarProvider>
      </ThemeProvider>
    </ApolloWrapper>
  </CurrentUserProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

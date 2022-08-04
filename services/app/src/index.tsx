import "./index.css";

import { CssBaseline } from "@material-ui/core";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import * as Sentry from "@sentry/react";
import { SnackbarProvider } from "material-ui-snackbar-provider";
import { useContext } from "react";
import ReactDOM from "react-dom";

import App from "./App";
import CustomSnackbar from "./components/Shared/Snackbar/CustomSnackbar";
import ApolloWrapper from "./contexts/ApolloClientProvider";
import { CurrentUserContext } from "./contexts/CurrentUserContext";
import CurrentUserProvider from "./contexts/CurrentUserProvider";
import reportWebVitals from "./reportWebVitals";

Sentry.init({
  dsn: process.env.REACT_APP_BESPOKE_SENTRY_DNS,
  environment: process.env.NODE_ENV,
});

const BespokePrimaryMain = "#769362";
const BlazePrimaryMain = "#2cb2dc";

const BespokePrimaryLight = "#dae6d3";
const BlazePrimaryLight = "#e3f2fd";

const BespokeContrastText = "#ffffff";
const BlazeContrastText = "#ffffff";

const BespokeTypographyFontFamily = ["Inter", "sans-serif"];
const BlazeTypographyFontFamily = ["Roboto", "sans-serif"];

const WrappedApp = function () {
  const {
    user: { isEmbeddedModule },
  } = useContext(CurrentUserContext);

  // Set theme values dynamically based on whether App is in embedded mode or not.
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: isEmbeddedModule ? BlazePrimaryMain : BespokePrimaryMain,
        light: isEmbeddedModule ? BlazePrimaryLight : BespokePrimaryLight,
        contrastText: isEmbeddedModule
          ? BlazeContrastText
          : BespokeContrastText,
      },
    },
    typography: {
      fontFamily: (isEmbeddedModule
        ? BlazeTypographyFontFamily
        : BespokeTypographyFontFamily
      ).join(","),
      // TODO: customize letter spacing.
      // body1: {
      //   letterSpacing: 14,
      // },
      button: {
        textTransform: "none",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider SnackbarComponent={CustomSnackbar}>
        <CssBaseline>
          <App />
        </CssBaseline>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <CurrentUserProvider>
    <ApolloWrapper>
      <WrappedApp />
    </ApolloWrapper>
  </CurrentUserProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

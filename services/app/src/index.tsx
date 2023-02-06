import "./index.css";

import { CssBaseline } from "@material-ui/core";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LicenseInfo } from "@mui/x-license-pro";
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";
import { SnackbarProvider } from "material-ui-snackbar-provider";
import { createRoot } from "react-dom/client";
import { Helmet } from "react-helmet";

import App from "./App";
import CustomSnackbar from "./components/Shared/Snackbar/CustomSnackbar";
import ApolloWrapper from "./contexts/ApolloClientProvider";
import CurrentUserProvider from "./contexts/CurrentUserProvider";
import reportWebVitals from "./reportWebVitals";

Sentry.init({
  dsn: process.env.REACT_APP_BESPOKE_SENTRY_DNS,
  environment: process.env.NODE_ENV,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

if (!!process.env.REACT_APP_MUI_PRO_LICENSE) {
  LicenseInfo.setLicenseKey(process.env.REACT_APP_MUI_PRO_LICENSE);
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <CurrentUserProvider>
    <Helmet>
      <script>
        {`
          <!-- Hotjar Tracking Code for https://app.bespokefinancial.com -->
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:3130230,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
      </script>
    </Helmet>
    <ApolloWrapper>
      <SnackbarProvider SnackbarComponent={CustomSnackbar}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline>
            <App />
          </CssBaseline>
        </LocalizationProvider>
      </SnackbarProvider>
    </ApolloWrapper>
  </CurrentUserProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.error))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import { Close } from "@material-ui/icons";
import { Alert, AlertTitle, Button, IconButton } from "@mui/material";
import { AlertColor } from "@mui/material/Alert";
import { ButtonProps } from "@mui/material/Button";
import Snackbar, { SnackbarProps } from "@mui/material/Snackbar";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { SnackbarMessageDelimeter } from "hooks/useSnackbar";
import { startCase } from "lodash";

interface Props {
  message?: string;
  action?: string;
  ButtonProps?: Partial<ButtonProps>;
  SnackbarProps: Partial<SnackbarProps>;
  customParameters: any;
}

export default function CustomSnackbar({
  message,
  action,
  ButtonProps,
  SnackbarProps,
  customParameters,
}: Props) {
  // Note: the magic delimeter separates the severity of the message
  // from the actual message, so we separate them before the render.
  const severity = !!message
    ? message.split(SnackbarMessageDelimeter)[0]
    : "error";
  const actualMessage = !!message
    ? message.split(SnackbarMessageDelimeter)[1]
    : "Developer error: invalid snackbar message";

  // Note: set `autoHideDuration` to `null` during development
  // if you want the snackbar to be sticky (not hide automatically).
  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      autoHideDuration={30000}
      {...SnackbarProps}
    >
      <Alert
        severity={severity as AlertColor}
        action={
          <>
            {action ? (
              <Button color="inherit" size="small" {...ButtonProps}>
                {action}
              </Button>
            ) : null}
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={(event) =>
                SnackbarProps.onClose &&
                SnackbarProps.onClose(event, "clickaway")
              }
            >
              <Close />
            </IconButton>
          </>
        }
      >
        <AlertTitle>{startCase(severity)}</AlertTitle>
        <Text materialVariant={"p"} textVariant={TextVariants.Label}>
          {actualMessage}
        </Text>
      </Alert>
    </Snackbar>
  );
}

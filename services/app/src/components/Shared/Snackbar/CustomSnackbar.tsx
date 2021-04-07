import { Button, IconButton, Snackbar } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import { SnackbarProps } from "@material-ui/core/Snackbar";
import { Close } from "@material-ui/icons";
import { Alert, AlertTitle } from "@material-ui/lab";
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
  // Note: set `autoHideDuration` to `null` during development
  // if you want the snackbar to be sticky (not hide automatically).
  return (
    <Snackbar autoHideDuration={30000} {...SnackbarProps}>
      <Alert
        severity={customParameters?.type}
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
        <AlertTitle>{startCase(customParameters?.type)}</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
}

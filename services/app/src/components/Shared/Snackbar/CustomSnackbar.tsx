import { Button, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

interface Props {
  message?: string;
  action?: string;
  ButtonProps?: object;
  SnackbarProps?: object;
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
    <Snackbar autoHideDuration={5000} {...SnackbarProps}>
      <Alert
        variant="filled"
        severity={customParameters?.type}
        action={
          action ? (
            <Button color="inherit" size="small" {...ButtonProps}>
              {action}
            </Button>
          ) : null
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

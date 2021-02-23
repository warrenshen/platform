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
  return (
    <Snackbar autoHideDuration={4000} {...SnackbarProps}>
      <Alert
        variant="filled"
        severity={customParameters?.type}
        action={
          action != null && (
            <Button color="inherit" size="small" {...ButtonProps}>
              {action}
            </Button>
          )
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

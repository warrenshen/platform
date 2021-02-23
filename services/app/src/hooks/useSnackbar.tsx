import { useSnackbar } from "material-ui-snackbar-provider";
import { useMemo } from "react";

export default function useCustomSnackbar() {
  const snackbar = useSnackbar();
  return useMemo(() => {
    const showMessage = (type: string) => (
      message: string,
      action = "",
      handleAction = () => {}
    ) => {
      snackbar.showMessage(message, action, handleAction, {
        type,
      });
    };
    return {
      ...snackbar,
      showError: showMessage("error"),
      showInfo: showMessage("info"),
      showMessage: showMessage("info"),
      showSuccess: showMessage("success"),
      showWarning: showMessage("warning"),
    };
  }, [snackbar]);
}

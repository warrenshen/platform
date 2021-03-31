import {
  Box,
  Button,
  createStyles,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import useSnackbar from "hooks/useSnackbar";
import { twoFactorRoutes, unAuthenticatedApi } from "lib/api";
import { useCallback, useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100vw",
      height: "100vh",
      overflow: "scroll",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: 400,
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    buttonClass: {
      marginLeft: theme.spacing(1),
    },
    propertyLabel: {
      flexGrow: 1,
    },
    constLabels: {
      minWidth: 150,
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
  })
);

interface Props {
  linkVal: string | null;
  codeEntered: string;
  setCodeEntered: (val: string) => void;
  onCodeSubmitted: () => void;
}

const sendTwoFactorSMSMessage = async (req: {
  link_val: string | null;
}): Promise<{ status: string; msg: string; phone_number: string }> => {
  return unAuthenticatedApi
    .post(twoFactorRoutes.sendTwoFactorSMSCode, req)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not send two factor SMS message",
        };
      }
    );
};

function AuthenticateViaPhonePage({
  linkVal,
  codeEntered,
  setCodeEntered,
  onCodeSubmitted,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleClickResend = useCallback(() => {
    sendTwoFactorSMSMessage({ link_val: linkVal }).then(function (resp) {
      if (resp.status !== "OK") {
        snackbar.showError("Failed to send sms message: " + resp.msg);
        return;
      }
      window.console.log(resp);
      setPhoneNumber(resp.phone_number);
    });
  }, [linkVal, snackbar]);

  useEffect(() => {
    handleClickResend();
  }, [handleClickResend]);

  const handleClickSubmit = () => {
    onCodeSubmitted();
  };

  const isSubmitDisabled = !codeEntered;

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        <Box display="flex" flexDirection="column">
          <Typography variant="h5">Authentiate via phone</Typography>
          {phoneNumber ? (
            <Box>
              <Box mt={1}>
                <Typography variant="body2">
                  {`For security reasons, please authenticate via a text message to continue. A text message with a code was sent to ${phoneNumber}. If this phone number is incorrect, please contact Bespoke Financial.`}
                </Typography>
              </Box>
              <Box mt={1}>
                <TextField
                  label="Enter code"
                  value={codeEntered}
                  onChange={({ target: { value } }) => setCodeEntered(value)}
                />
              </Box>
              <Box mt={3}>
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant={"contained"}
                    color={"default"}
                    onClick={handleClickResend}
                  >
                    Resend Text
                  </Button>
                  <Button
                    disabled={isSubmitDisabled}
                    variant={"contained"}
                    color={"primary"}
                    onClick={handleClickSubmit}
                  >
                    Submit Code
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box mt={1}>
                <Typography variant="body2">
                  {`Error: we do not have your phone number in our records. Please contact Bespoke Financial to set up a phone number.`}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default AuthenticateViaPhonePage;
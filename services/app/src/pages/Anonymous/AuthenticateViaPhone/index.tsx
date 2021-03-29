import {
  Box,
  Button,
  createStyles,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

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
  location: any;
}

function AuthenticateViaPhonePage({ location }: Props) {
  const classes = useStyles();
  const history = useHistory();

  const payload = location.state?.payload;
  // const linkVal = location.state?.link_val;
  const phoneNumber = payload?.phone_number || "4085293475";

  const [code, setCode] = useState("");

  useEffect(() => {
    console.log({ message: "Request Python API to send text message here..." });
  }, []);

  const handleClickResend = () => {
    console.log({ message: "Request Python API to send text message here..." });
  };

  const handleClickSubmit = () => {
    console.log({ message: "Request Python API to validate code here..." });
    if (false) {
      history.push("secure link for next step here...");
    }
  };

  const isSubmitDisabled = !code;

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
                  value={code}
                  onChange={({ target: { value } }) => setCode(value)}
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

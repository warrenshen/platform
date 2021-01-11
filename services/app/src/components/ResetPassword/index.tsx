import {
  Box,
  Button,
  createStyles,
  FormHelperText,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useTitle } from "react-use";

export interface ResetPasswordParams {
  hmac: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: "100%",
      height: "100%",
      float: "left",
      margin: 0,
      padding: 0,
      backgroundSize: "cover",
      overflow: "hidden",
      backgroundImage: `url(${process.env.PUBLIC_URL}/signInBackground.jpg)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    formContainer: {
      background: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: 400,
      padding: theme.spacing(4),
      paddingTop: theme.spacing(2),
    },
    imageBox: {
      display: "flex",
      justifyContent: "center",
    },
    formInput: {
      margin: theme.spacing(1),
    },
    signInButton: {
      marginTop: theme.spacing(2),
      width: 120,
      marginLeft: "auto",
      marginRight: "auto",
    },
  })
);

function ResetPassword() {
  const classes = useStyles();
  useTitle("Reset Password | Bespoke");

  const history = useHistory();
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    try {
      history.push(history.location);
    } catch (err) {
      setError("Error occurred while trying to reset password.");
    }
  };

  return (
    <Box className={classes.container}>
      <form onSubmit={onFormSubmit} className={classes.formContainer}>
        <Box className={classes.imageBox}>
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" />
        </Box>
        <TextField
          type="password"
          label="New Password"
          className={classes.formInput}
          value={newPassword}
          onChange={({ target: { value } }) => {
            setNewPassword(value);
          }}
        ></TextField>
        <TextField
          type="password"
          label="Password Confirm"
          className={classes.formInput}
          value={passwordConfirm}
          onChange={({ target: { value } }) => {
            setPasswordConfirm(value);
          }}
        ></TextField>
        <FormHelperText className={classes.formInput} error>
          {error}
        </FormHelperText>
        <Button
          type="submit"
          className={classes.signInButton}
          disabled={
            !newPassword || !passwordConfirm || newPassword !== passwordConfirm
          }
          variant="contained"
          color="primary"
        >
          Reset
        </Button>
      </form>
    </Box>
  );
}

export default ResetPassword;

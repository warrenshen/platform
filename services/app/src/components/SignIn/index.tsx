import {
  Box,
  Button,
  createStyles,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useCallback, useContext, useState } from "react";
import { useTitle } from "react-use";

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
      backgroundImage: `url(${process.env.PUBLIC_URL}/logInBg.jpg)`,
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
    loginButton: {
      marginTop: theme.spacing(2),
      width: 120,
      marginLeft: "auto",
      marginRight: "auto",
    },
  })
);

function SignIn() {
  const classes = useStyles();
  useTitle("Login | Bespoke");

  const { signIn } = useContext(CurrentUserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await signIn(email, password);
    },
    [email, password, signIn]
  );

  return (
    <Box className={classes.container}>
      <form onSubmit={onSubmit}>
        <Box className={classes.formContainer}>
          <Box className={classes.imageBox}>
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" />
          </Box>
          <TextField
            data-cy="signin-input-email"
            label="Email"
            className={classes.formInput}
            value={email}
            onChange={({ target: { value } }) => {
              setEmail(value);
            }}
          ></TextField>
          <TextField
            data-cy="signin-input-password"
            type="password"
            label="Password"
            className={classes.formInput}
            value={password}
            onChange={({ target: { value } }) => {
              setPassword(value);
            }}
          ></TextField>
          <Button
            data-cy="signin-button"
            className={classes.loginButton}
            disabled={!email || !password}
            variant="contained"
            color="primary"
            type="submit"
          >
            Sign in
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default SignIn;

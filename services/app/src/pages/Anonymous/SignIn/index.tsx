import {
  Box,
  Button,
  createStyles,
  FormHelperText,
  makeStyles,
  TextField,
  Link,
  Theme,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { routes, anonymousRoutes } from "lib/routes";
import { relative } from "path";
import { useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
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
      position: "relative",
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
    forgotLink: {
      position: "relative",
      margin: "auto",
    },
    signInButton: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(3),
      width: 120,
      marginLeft: "auto",
      marginRight: "auto",
    },
  })
);

function SignIn() {
  const classes = useStyles();
  useTitle("Sign In | Bespoke");

  const { isSignedIn, signIn } = useContext(CurrentUserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { state }: any = useLocation();
  const history = useHistory();

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // If sign in is successful, isSignedIn will flip to true and cause a history.push below.
      // `await` is necessary here (even though the IDE says it is not)
      // to catch any errors thrown by `signIn`.
      await signIn(email, password);
    } catch (err) {
      setError(
        "Error encountered while attempting to sign in. Please try again!"
      );
      setPassword("");
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      history.push(state?.from || routes.root);
    }
  }, [isSignedIn, history, state?.from]);

  return (
    <Box className={classes.container}>
      <form onSubmit={onFormSubmit} className={classes.formContainer}>
        <Box className={classes.imageBox}>
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" />
        </Box>
        <TextField
          data-cy="sign-in-input-email"
          label="Email"
          className={classes.formInput}
          value={email}
          onChange={({ target: { value } }) => {
            setEmail(value);
          }}
        ></TextField>
        <TextField
          data-cy="sign-in-input-password"
          type="password"
          label="Password"
          className={classes.formInput}
          value={password}
          onChange={({ target: { value } }) => {
            setPassword(value);
          }}
        ></TextField>
        <FormHelperText className={classes.formInput} error>
          {error}
        </FormHelperText>
        <Button
          data-cy="sign-in-button"
          type="submit"
          className={classes.signInButton}
          disabled={!email || !password}
          variant="contained"
          color="primary"
        >
          Sign in
        </Button>
        <div className={classes.forgotLink}>
          <Link
            key={anonymousRoutes.forgotPassword}
            href={anonymousRoutes.forgotPassword}
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </Box>
  );
}

export default SignIn;

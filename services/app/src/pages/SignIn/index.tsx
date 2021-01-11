import {
  Box,
  Button,
  createStyles,
  FormHelperText,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
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

function SignIn() {
  const classes = useStyles();
  useTitle("Sign In | Bespoke");

  const { signIn } = useContext(CurrentUserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const history = useHistory();

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await signIn(email, password);
      history.push(history.location);
    } catch (err) {
      setError(
        "We encountered an error while attempting to sign in. Please try again!"
      );
    }
  };

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
      </form>
    </Box>
  );
}

export default SignIn;

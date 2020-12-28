import {
  Box,
  Button,
  createStyles,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useContext, useState } from "react";
import { useTitle } from "react-use";
import { authEndpoints } from "routes";

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

  const { setSignedIn } = useContext(CurrentUserContext);
  const [email, setEmail] = useState("admin@bespoke.com");
  const [password, setPassword] = useState("password123");

  return (
    <Box className={classes.container}>
      <Box className={classes.formContainer}>
        <Box className={classes.imageBox}>
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" />
        </Box>
        <TextField
          label="Email"
          className={classes.formInput}
          value={email}
          onChange={({ target: { value } }) => {
            setEmail(value);
          }}
        ></TextField>
        <TextField
          type="password"
          label="Password"
          className={classes.formInput}
          value={password}
          onChange={({ target: { value } }) => {
            setPassword(value);
          }}
        ></TextField>
        <Button
          className={classes.loginButton}
          disabled={!email || !password}
          onClick={async () => {
            const response = await fetch(authEndpoints.login, {
              method: "POST",
              mode: "cors",
              cache: "no-cache",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);
            setSignedIn(true);
          }}
          variant="contained"
          color="primary"
        >
          Login
        </Button>
      </Box>
    </Box>
  );
}

export default SignIn;

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
  const currentUser = useContext(CurrentUserContext);
  const classes = useStyles();
  useTitle("Login | Bespoke");

  const [usernameInput, setUsername] = useState("");
  const [passwordInput, setPassword] = useState("");

  const loginUser = (username: string, password: string) => {
    currentUser.setAuthentication(true);
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.formContainer}>
        <Box className={classes.imageBox}>
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" />
        </Box>
        <TextField
          label="Username"
          className={classes.formInput}
          value={usernameInput}
          onChange={({ target: { value } }) => {
            setUsername(value);
          }}
        ></TextField>
        <TextField
          type="password"
          label="Password"
          className={classes.formInput}
          value={passwordInput}
          onChange={({ target: { value } }) => {
            setPassword(value);
          }}
        ></TextField>
        <Button
          className={classes.loginButton}
          disabled={!usernameInput || !passwordInput}
          onClick={async () => {
            loginUser(usernameInput, passwordInput);
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

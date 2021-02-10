import {
  Box,
  Button,
  createStyles,
  FormHelperText,
  Link,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { authenticatedApi, authRoutes } from "lib/api";
import { routes } from "lib/routes";
import { useContext, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTitle } from "react-use";

interface Props {
  location: any;
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
      padding: theme.spacing(3),
      paddingTop: theme.spacing(2),
    },
    imageBox: {
      display: "flex",
      justifyContent: "center",
    },
    formInput: {
      display: "flex",
      margin: theme.spacing(2),
    },
    error: {
      marginTop: 0,
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
    form: {
      height: "80px",
    },
    text: {
      margin: theme.spacing(1),
      textAlign: "center",
      whiteSpace: "pre",
    },
    formHeader: {
      fontSize: "18px",
      margin: "auto",
      padding: "12px 0",
    },
    submitButton: {
      marginTop: theme.spacing(2),
      width: 120,
      marginLeft: "auto",
      marginRight: "auto",
    },
  })
);

function ForgotPassword(props: Props) {
  const classes = useStyles();
  useTitle("Forgot Password | Bespoke");

  const history = useHistory();
  const { state }: any = useLocation();
  const { isSignedIn } = useContext(CurrentUserContext);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const correctEmail = useMemo(
    () =>
      email.length &&
      !!email.match(/^[\w\+.-]+@(?=[a-z\d][^.]*\.)[a-z\d.-]*[a-z\d]$/gi),
    [email]
  );

  useEffect(() => {
    if (isSignedIn) {
      history.push(state?.from || routes.root);
    }
  }, [isSignedIn, history, state?.from]);

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await authenticatedApi.post(authRoutes.forgotPassword, {
        email,
      });
      if (response.data?.status === "ERROR") {
        setError(response.data?.msg);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      !error.length &&
        setError(
          "Error encountered while sending an email. Please try again or enter another email."
        );
    }
  };

  return (
    <>
      <Box className={classes.container}>
        <form onSubmit={onFormSubmit} className={classes.formContainer}>
          <Link key={routes.signIn} href={routes.signIn}>
            ← Back
          </Link>
          <Box className={classes.imageBox}>
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" />
          </Box>
          {!success ? (
            <>
              <Typography className={classes.formHeader}>
                Forgot your password?
              </Typography>
              <div className={classes.text}>
                Enter your email below to reset your password.
              </div>
              <div className={classes.form}>
                <TextField
                  data-cy="email-input"
                  label="Email"
                  className={classes.formInput}
                  value={email}
                  error={!!email.length && !correctEmail}
                  required
                  helperText={""}
                  onChange={({ target: { value } }) => {
                    error.length && setError("");
                    setEmail(value);
                  }}
                ></TextField>
              </div>
              {error && (
                <FormHelperText className={classes.error} error>
                  {error}
                </FormHelperText>
              )}
              <Button
                data-cy="submit-button"
                type="submit"
                className={classes.submitButton}
                disabled={!correctEmail}
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            </>
          ) : (
            <>
              <Typography className={classes.formHeader}>
                {"Email was sent"}
              </Typography>
              <Typography className={classes.text}>
                {"Please check your email for the next step."}
              </Typography>
            </>
          )}
        </form>
      </Box>
    </>
  );
}

export default ForgotPassword;

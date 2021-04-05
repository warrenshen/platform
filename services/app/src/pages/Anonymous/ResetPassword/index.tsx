import {
  Box,
  Button,
  createStyles,
  FormHelperText,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import BespokeFinancialLogo from "components/Shared/Layout/logo.png";
import { authenticatedApi, authRoutes } from "lib/api";
import { routes } from "lib/routes";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
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
      padding: theme.spacing(4),
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
      height: "150px",
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

function ResetPassword(props: Props) {
  const classes = useStyles();
  useTitle("Reset Password | Bespoke");

  const linkVal = props.location.state?.link_val;

  const history = useHistory();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmationPassword, setConfirmationPassword] = useState("");

  const notEmptyPasswords = useMemo<boolean>(
    () => !!password && !!confirmationPassword,
    [password, confirmationPassword]
  );

  const canSubmit = useMemo<boolean>(
    () => notEmptyPasswords && password === confirmationPassword,
    [notEmptyPasswords, password, confirmationPassword]
  );

  const passwordsMatch = useMemo<boolean>(
    () => notEmptyPasswords && confirmationPassword !== password,
    [notEmptyPasswords, confirmationPassword, password]
  );

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const params = {
        password,
        link_val: linkVal,
      };
      const response = await authenticatedApi.post(
        authRoutes.resetPassword,
        params
      );
      if (response.data?.status === "ERROR") {
        alert(response.data?.msg);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(
        "Error encountered while updating the password. Please try again!"
      );
    }
  };

  return (
    <>
      <Box className={classes.container}>
        <form onSubmit={onFormSubmit} className={classes.formContainer}>
          <Box className={classes.imageBox}>
            <img
              src={BespokeFinancialLogo}
              alt="Bespoke Financial Logo"
              width={156}
              height={32}
            />
          </Box>
          {!success ? (
            <>
              <Typography className={classes.formHeader}>
                Reset password
              </Typography>
              <div className={classes.form}>
                <TextField
                  data-cy="reset-password-input"
                  type="password"
                  label="New password"
                  required
                  className={classes.formInput}
                  value={password}
                  onChange={({ target: { value } }) => {
                    error.length && setError("");
                    setPassword(value);
                  }}
                />
                <TextField
                  data-cy="reset-password-input-confirmation"
                  type="password"
                  label="Confirm password"
                  error={passwordsMatch}
                  required
                  className={classes.formInput}
                  value={confirmationPassword}
                  helperText={passwordsMatch ? "Passwords do not match" : ""}
                  onChange={({ target: { value } }) => {
                    error.length && setError("");
                    setConfirmationPassword(value);
                  }}
                />
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
                disabled={!canSubmit}
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            </>
          ) : (
            <>
              <Typography className={classes.formInput}>
                Password has been successfully updated!
              </Typography>
              <Button
                data-cy="submit-button"
                type="submit"
                className={classes.submitButton}
                variant="contained"
                color="primary"
                onClick={() => history.push(routes.signIn)}
              >
                Sign in
              </Button>
            </>
          )}
        </form>
      </Box>
    </>
  );
}

export default ResetPassword;

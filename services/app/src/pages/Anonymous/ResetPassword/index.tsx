import {
  Box,
  Button,
  FormHelperText,
  TextField,
  Typography,
} from "@material-ui/core";
import AuthPage from "components/Shared/Page/AuthPage";
import { authRoutes, authenticatedApi } from "lib/api";
import { routes } from "lib/routes";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTitle } from "react-use";

interface Props {
  location: any;
}

function ResetPassword(props: Props) {
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
    <AuthPage>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h5">Reset password</Typography>
          <Box mt={1}>
            <Typography variant="body2">
              Enter your new password below.
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <form onSubmit={onFormSubmit}>
          {!success ? (
            <>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  data-cy="reset-password-input"
                  autoFocus
                  type="password"
                  label="New password"
                  required
                  value={password}
                  onChange={({ target: { value } }) => {
                    error.length && setError("");
                    setPassword(value);
                  }}
                />
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <TextField
                  data-cy="reset-password-input-confirmation"
                  type="password"
                  label="Confirm password"
                  error={passwordsMatch}
                  required
                  value={confirmationPassword}
                  helperText={passwordsMatch ? "Passwords do not match" : ""}
                  onChange={({ target: { value } }) => {
                    error.length && setError("");
                    setConfirmationPassword(value);
                  }}
                />
              </Box>
              {!!error && (
                <Box display="flex" flexDirection="column" mt={2}>
                  <FormHelperText error>{error}</FormHelperText>
                </Box>
              )}
              <Box display="flex" flexDirection="column" mt={4}>
                <Button
                  data-cy="submit-button"
                  type="submit"
                  disabled={!canSubmit}
                  variant="contained"
                  color="primary"
                >
                  Submit
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mt={4}
              >
                <Typography variant="body1">
                  Success! Password changed.
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" mt={2}>
                <Button
                  data-cy="submit-button"
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={() => history.push(routes.signIn)}
                >
                  Sign in
                </Button>
              </Box>
            </>
          )}
        </form>
      </Box>
    </AuthPage>
  );
}

export default ResetPassword;

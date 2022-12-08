import {
  Box,
  Button,
  FormHelperText,
  Link,
  TextField,
  Typography,
} from "@material-ui/core";
import AuthPage from "components/Shared/Page/AuthPage";
import { authRoutes, authenticatedApi } from "lib/api";
import { routes } from "lib/routes";
import { useMemo, useState } from "react";
import { useTitle } from "react-use";

export default function ForgotPasswordPage() {
  useTitle("Forgot Password | Bespoke");

  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const correctEmail = useMemo(
    () => email.length && !!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/gi),
    [email]
  );

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
    <AuthPage>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h5">Forgot password</Typography>
          <Box mt={1}>
            <Typography variant="body2">
              Enter your email below to reset your password.
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
                  data-cy="email-input"
                  autoFocus
                  label="Email"
                  value={email}
                  error={!!email.length && !correctEmail}
                  required
                  helperText={""}
                  onChange={({ target: { value } }) => {
                    error.length && setError("");
                    setEmail(value);
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
                  disabled={!correctEmail}
                  variant="contained"
                  color="primary"
                >
                  Submit
                </Button>
              </Box>
            </>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mt={4}
            >
              <Typography variant="body1">
                Success! Please check your email for the next step.
              </Typography>
            </Box>
          )}
          <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            <Link key={routes.signIn} href={routes.signIn}>
              Sign in instead?
            </Link>
          </Box>
        </form>
      </Box>
    </AuthPage>
  );
}

import {
  Box,
  Button,
  FormHelperText,
  Link,
  TextField,
  Typography,
} from "@material-ui/core";
import AuthPage from "components/Shared/Page/AuthPage";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { anonymousRoutes } from "lib/routes";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTitle } from "react-use";

export default function SignInPage() {
  useTitle("Sign In | Bespoke");

  const { signIn } = useContext(CurrentUserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // If sign in is successful, isSignedIn will flip to true and cause a history.push below.
      // `await` is necessary here (even though the IDE says it is not)
      // to catch any errors thrown by `signIn`.
      await signIn(email, password, (successUrl) => navigate(successUrl));
    } catch (err) {
      setError("Error: email and password combination not valid.");
      setPassword("");
    }
  };

  return (
    <AuthPage>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h5">Sign in</Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <form onSubmit={onFormSubmit}>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              data-cy="sign-in-input-email"
              autoFocus
              label="Email"
              value={email}
              onChange={({ target: { value } }) => setEmail(value)}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              data-cy="sign-in-input-password"
              type="password"
              label="Password"
              value={password}
              onChange={({ target: { value } }) => setPassword(value)}
            />
          </Box>
          {!!error && (
            <Box display="flex" flexDirection="column" mt={2}>
              <FormHelperText data-cy="sign-in-error" error>
                {error}
              </FormHelperText>
            </Box>
          )}
          <Box display="flex" flexDirection="column" mt={4}>
            <Button
              data-cy="sign-in-button"
              type="submit"
              disabled={!email || !password}
              variant="contained"
              color="primary"
            >
              Sign in
            </Button>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            <Link
              key={anonymousRoutes.forgotPassword}
              href={anonymousRoutes.forgotPassword}
            >
              Forgot password?
            </Link>
          </Box>
        </form>
      </Box>
    </AuthPage>
  );
}

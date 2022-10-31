import { Box, Button, TextField, Typography } from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import useSnackbar from "hooks/useSnackbar";
import { twoFactorRoutes, unAuthenticatedApi } from "lib/api";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  height: 100vh;
  overflow: scroll;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  max-width: 600px;
`;

interface Props {
  linkVal: string | null;
  codeEntered: string;
  setCodeEntered: (val: string) => void;
  onCodeSubmitted: () => void;
}

const sendTwoFactorMessage = async (req: {
  link_val: string | null;
}): Promise<{
  status: string;
  msg: string;
  phone_number: string;
  email: string;
  message_method: string;
  link_type: string;
}> => {
  return unAuthenticatedApi
    .post(twoFactorRoutes.sendTwoFactorCode, req)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not send two factor SMS message",
        };
      }
    );
};

export default function AuthenticateViaTwoFactorPage({
  linkVal,
  codeEntered,
  setCodeEntered,
  onCodeSubmitted,
}: Props) {
  const snackbar = useSnackbar();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [linkType, setLinkType] = useState<string>("");
  const [messageMethod, setMessageMethod] = useState<string>("phone");

  const sentMessageOnLoad = useRef(false);

  const handleClickResend = useCallback(() => {
    sendTwoFactorMessage({ link_val: linkVal }).then(function (resp) {
      if (resp.status !== "OK") {
        snackbar.showError("Failed to send message: " + resp.msg);
        return;
      }
      // Fill in some details for the UI
      setPhoneNumber(resp.phone_number);
      setLinkType(resp.link_type);
      setMessageMethod(resp.message_method);
      setEmail(resp.email);

      if (resp.link_type === "forgot_password") {
        // In the forgot_password case, we immediately request that we pull out
        // the link information, no need for the user to use a code.
        onCodeSubmitted();
      }
    });
  }, [linkVal, snackbar, onCodeSubmitted, setLinkType]);

  useEffect(() => {
    if (sentMessageOnLoad.current) {
      return;
    }
    handleClickResend();
    sentMessageOnLoad.current = true;
  }, [handleClickResend]);

  const handleClickSubmit = () => {
    onCodeSubmitted();
  };

  const isSubmitDisabled = !codeEntered;

  if (linkType === "forgot_password" || linkType === "") {
    return (
      <Wrapper>
        <Container>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h5">
              {linkVal ? "Loading..." : "No link value provided."}
            </Typography>
          </Box>
        </Container>
      </Wrapper>
    );
  }

  const hasContactInfo =
    messageMethod === "phone" ? phoneNumber.length > 0 : email.length > 0;

  const authenticateTitle =
    messageMethod === "phone"
      ? "Authenticate via phone (2FA)"
      : "Authenticate via email (2FA)";

  const msgToUser =
    messageMethod === "phone"
      ? `For security reasons, please authenticate via phone to continue. A text message with a code was sent to ${phoneNumber}. If this phone number is incorrect, please contact Bespoke Financial.`
      : `For security reasons, please authenticate via email to continue. An email with a code was sent to ${email}. If this email is incorrect, please contact Bespoke Financial.`;

  const resendMsg =
    messageMethod === "phone"
      ? "Resend code via text message"
      : "Resend code via email";

  return (
    <Wrapper>
      <Box mt={3} />
      <Typography variant="h4">{authenticateTitle}</Typography>
      <Container>
        <Box display="flex" flexDirection="column">
          {hasContactInfo ? (
            <Box>
              <Box mt={2}>
                <Typography variant="body1">{msgToUser}</Typography>
              </Box>
              <Box display="flex" flexDirection="column" mt={3}>
                <TextField
                  data-cy={"2fa-input"}
                  autoFocus
                  label="Enter 2FA code"
                  value={codeEntered}
                  onChange={({ target: { value } }) => setCodeEntered(value)}
                />
              </Box>
              <Box display="flex" flexDirection="column" mt={4}>
                <PrimaryButton
                  dataCy={"continue-review-po"}
                  isDisabled={isSubmitDisabled}
                  text={"Continue"}
                  height={"40px"}
                  margin={"0"}
                  onClick={handleClickSubmit}
                />
              </Box>
              <Box display="flex" flexDirection="column" mt={1} mb={4}>
                <Button
                  variant={"text"}
                  color={"primary"}
                  onClick={handleClickResend}
                  style={{ fontWeight: 600 }}
                >
                  {resendMsg}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box mt={1}>
                <Typography variant="body2">
                  {`Error: we do not have your contact information in our records. Please contact Bespoke Financial to set up your contact information.`}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </Wrapper>
  );
}

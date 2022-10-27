import { CurrentUserContext } from "contexts/CurrentUserContext";
import useSnackbar from "hooks/useSnackbar";
import { twoFactorRoutes, unAuthenticatedApi } from "lib/api";
import { setAccessToken, setRefreshToken } from "lib/auth/tokenStorage";
import { anonymousRoutes, routes } from "lib/routes";
import { useCallback, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AuthenticateViaTwoFactorPage from "../AuthenticateViaTwoFactor";

type FormInfo = {
  type: string;
  payload: any;
};

type GetSecureLinkPayloadResp = {
  status: string;
  msg?: string;
  form_info: FormInfo;
  access_token: string;
  refresh_token: string;
};

const linkTypeToRoute: { [type: string]: string } = {
  confirm_purchase_order: anonymousRoutes.reviewPurchaseOrderOld,
  confirm_invoice: anonymousRoutes.reviewInvoice,
  forgot_password: anonymousRoutes.resetPassword,
  pay_invoice: anonymousRoutes.reviewInvoicePayment,
  login: routes.root,
};

const getSecureLinkPayload = async (req: {
  val: string;
  provided_token_val: string;
}): Promise<GetSecureLinkPayloadResp> => {
  return unAuthenticatedApi
    .post(twoFactorRoutes.getSecureLinkPayload, req)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return { status: "ERROR", msg: "Could not get upload url" };
      }
    );
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SecureLink() {
  const query = useQuery();
  const linkVal = query.get("val");
  const [codeEntered, setCodeEntered] = useState<string>("");
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const { resetUser } = useContext(CurrentUserContext);

  const onCodeSubmitted = useCallback(() => {
    if (!linkVal) {
      return;
    }
    getSecureLinkPayload({
      val: linkVal,
      provided_token_val: codeEntered,
    }).then(function (resp) {
      if (resp.status !== "OK") {
        snackbar.showError(resp.msg || "");
        return;
      }
      if (!resp.form_info) {
        snackbar.showError("No form information retrieved");
        return;
      }

      if (resp.access_token && resp.access_token.length > 0) {
        // Some links do not set the access token or temporary "sign-in" state of the user.
        setAccessToken(resp.access_token);
        setRefreshToken(resp.refresh_token);
        resetUser();
      }

      if (!(resp.form_info.type in linkTypeToRoute)) {
        snackbar.showError(
          "Unregistered type associated with link. Type: " + resp.form_info.type
        );
        return;
      }

      navigate(linkTypeToRoute[resp.form_info.type], {
        state: {
          payload: resp.form_info.payload,
          link_val: linkVal,
        },
      });
    });
  }, [linkVal, navigate, resetUser, codeEntered, snackbar]);

  return (
    <AuthenticateViaTwoFactorPage
      linkVal={linkVal}
      codeEntered={codeEntered}
      setCodeEntered={setCodeEntered}
      onCodeSubmitted={onCodeSubmitted}
    />
  );
}

export default SecureLink;

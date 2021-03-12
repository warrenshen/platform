import { Box } from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { twoFactorRoutes, unAuthenticatedApi } from "lib/api";
import { setAccessToken, setRefreshToken } from "lib/auth/tokenStorage";
import { anonymousRoutes } from "lib/routes";
import { useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

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
  confirm_purchase_order: anonymousRoutes.reviewPurchaseOrder,
  confirm_invoice: anonymousRoutes.reviewInvoice,
  forgot_password: anonymousRoutes.resetPassword,
};

const getSecureLinkPayload = async (req: {
  val: string;
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
  const [errMsg, setErrMsg] = useState<string>("");
  const history = useHistory();

  const { resetUser } = useContext(CurrentUserContext);

  useEffect(() => {
    if (!linkVal) {
      return;
    }
    getSecureLinkPayload({ val: linkVal }).then(function (resp) {
      if (resp.status !== "OK") {
        setErrMsg(resp.msg || "");
        return;
      }
      if (!resp.form_info) {
        setErrMsg("No form information retrieved");
        return;
      }

      if (resp.access_token && resp.access_token.length > 0) {
        // Some links do not set the access token or temporary "sign-in" state of the user.
        setAccessToken(resp.access_token);
        setRefreshToken(resp.refresh_token);
        resetUser();
      }

      if (!(resp.form_info.type in linkTypeToRoute)) {
        setErrMsg(
          "Unregistered type associated with link. Type: " + resp.form_info.type
        );
        return;
      }

      history.push({
        pathname: linkTypeToRoute[resp.form_info.type],
        state: {
          payload: resp.form_info.payload,
          link_val: linkVal,
        },
      });
    });
  }, [linkVal, history, resetUser]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100vw"
      height="100vh"
    >
      <Box display="flex" flexDirection="column">
        <Box>
          <p>
            {!linkVal
              ? "No link value provided."
              : errMsg
              ? `Error loading link: ${errMsg}.`
              : "Loading..."}
          </p>
        </Box>
      </Box>
    </Box>
  );
}

export default SecureLink;

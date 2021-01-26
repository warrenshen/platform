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
  confirm_purchase_order: anonymousRoutes.confirmPurchaseOrder,
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

      setAccessToken(resp.access_token);
      setRefreshToken(resp.refresh_token);
      resetUser();

      if (!(resp.form_info.type in linkTypeToRoute)) {
        setErrMsg(
          "Unregistered type associated with link. Type: " + resp.form_info.type
        );
        return;
      }
      history.push({
        pathname: linkTypeToRoute[resp.form_info.type],
        state: { payload: resp.form_info.payload },
      });
    });
  }, [linkVal, history, resetUser]);

  if (!linkVal) {
    return <div>No link value provided.</div>;
  }

  if (errMsg) {
    return <div>Error loading link: {errMsg}</div>;
  }

  return <div>Loading...</div>;
}

export default SecureLink;

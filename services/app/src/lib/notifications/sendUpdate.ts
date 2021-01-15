import { notifyEndpoints } from "lib/routes";

type Recipient = {
  email: string;
};

type SendNotificationReq = {
  type: string;
  template_id: string;
  template_data: { [key: string]: string };
  recipients: Recipient[];
};

type SendNotificationResp = {
  status: string;
  msg?: string;
};

export const notifyTemplates = {
  VENDOR_AGREEMENT_SIGNUP: {
    name: "vendor_agreement_signup",
    id: "d-58c45054a5254f64a81bd6695709aed0",
  },
};

export function sendNotification(
  req: SendNotificationReq
): Promise<SendNotificationResp> {
  return fetch(notifyEndpoints.sendNotification, {
    method: "POST",
    body: JSON.stringify(req),
  })
    .then((res) => {
      return res.json();
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
}

import { authenticatedApi, notifyRoutes } from "lib/api";

type Recipient = {
  email: string;
};

type NotifyTemplate = {
  name: string;
  id: string;
};

type SendNotificationReq = {
  type: string;
  template_config: NotifyTemplate;
  template_data: { [key: string]: string };
  recipients: Recipient[];
};

type SendNotificationResp = {
  status: string;
  msg?: string;
};

export const notifyTemplates: { [key: string]: NotifyTemplate } = {
  VENDOR_AGREEMENT_SIGNUP: {
    name: "vendor_agreement_signup",
    id: "d-58c45054a5254f64a81bd6695709aed0",
  },
};

export async function sendNotification(
  req: SendNotificationReq
): Promise<SendNotificationResp> {
  return authenticatedApi
    .post(notifyRoutes.sendNotification, req)
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
}

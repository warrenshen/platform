import { authenticatedApi, notifyRoutes } from "lib/api";

type Recipient = {
  email: string;
};

type NotifyTemplate = {
  name: string;
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
  VENDOR_AGREEMENT_WITH_CUSTOMER: {
    name: "vendor_agreement_with_customer",
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

import { authenticatedApi, notifyRoutes } from "lib/api";

export type Recipient = {
  email: string;
};

export type NotifyTemplate = {
  name: string;
};

export type SendNotificationReq = {
  type: string;
  template_config: NotifyTemplate;
  template_data: { [key: string]: string };
  recipients: Recipient[];
};

export type SendNotificationResp = {
  status: string;
  msg?: string;
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

import { authenticatedApi, notifyRoutes } from "lib/api";

export type NotifyTypeConfig = {
  namespace: string;
  name: string;
};

export type SendNotificationReq = {
  type_config: NotifyTypeConfig;
  input_data: { [key: string]: string | undefined };
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
        return { status: "ERROR", msg: "Could not send notification" };
      }
    );
}

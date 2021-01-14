import { notifyEndpoints } from "routes";

type Recipient = {
    email: string
}

type SendNotificationReq = {
    type: string,
    template_id: string,
    recipients: Recipient[]
}

type SendNotificationResp = {
    status: string,
    msg?: string
}
 
export function sendNotification(req: SendNotificationReq): Promise<SendNotificationResp> {
    return fetch(notifyEndpoints.sendNotification, {
        method: "POST",
        body: JSON.stringify(req)
      }
    ).then((res) => {
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
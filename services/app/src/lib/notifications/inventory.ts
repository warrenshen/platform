import {
  NotifyTemplate,
  Recipient,
  sendNotification,
  SendNotificationResp,
} from "./sendUpdate";

const notifyTemplates: { [key: string]: NotifyTemplate } = {
  VENDOR_AGREEMENT_WITH_CUSTOMER: {
    name: "vendor_agreement_with_customer",
  },
  VENDOR_APPROVED_NOTIFY_CUSTOMER: {
    name: "vendor_approved_notify_customer",
  },
  VENDOR_APPROVED_NOTIFY_VENDOR: {
    name: "vendor_approved_notify_vendor",
  },
};

export class InventoryNotifier {
  _msgType: string; // Whether to send via email, text etc

  constructor(msgType: string) {
    this._msgType = msgType;
  }

  sendVendorAgreementWithCustomer(
    template_data: { customer_name: string; docusign_link: string },
    recipients: Recipient[]
  ): Promise<SendNotificationResp> {
    const reqData = {
      type: this._msgType,
      template_config: notifyTemplates.VENDOR_AGREEMENT_WITH_CUSTOMER,
      template_data: template_data,
      recipients: recipients,
    };
    return sendNotification(reqData);
  }

  sendVendorApprovedNotifyCustomer(
    template_data: { vendor_name: string },
    recipients: Recipient[]
  ): Promise<SendNotificationResp> {
    const reqData = {
      type: this._msgType,
      template_config: notifyTemplates.VENDOR_APPROVED_NOTIFY_CUSTOMER,
      template_data: template_data,
      recipients: recipients,
    };
    return sendNotification(reqData);
  }

  sendVendorApprovedNotifyVendor(
    template_data: { vendor_name: string; customer_name: string },
    recipients: Recipient[]
  ): Promise<SendNotificationResp> {
    const reqData = {
      type: this._msgType,
      template_config: notifyTemplates.VENDOR_APPROVED_NOTIFY_VENDOR,
      template_data: template_data,
      recipients: recipients,
    };
    return sendNotification(reqData);
  }
}

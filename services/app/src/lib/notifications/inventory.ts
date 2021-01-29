import {
  NotifyTypeConfig,
  sendNotification,
  SendNotificationResp,
} from "./sendUpdate";

const notifyTypes: { [key: string]: NotifyTypeConfig } = {
  VENDOR_AGREEMENT_WITH_CUSTOMER: {
    namespace: "purchase_order",
    name: "vendor_agreement_with_customer",
  },
  VENDOR_APPROVED: {
    namespace: "purchase_order",
    name: "vendor_approved",
  },
};

export class InventoryNotifier {
  constructor() {}

  sendVendorAgreementWithCustomer(input_data: {
    vendor_id: string;
    company_id: string;
  }): Promise<SendNotificationResp> {
    const reqData = {
      type_config: notifyTypes.VENDOR_AGREEMENT_WITH_CUSTOMER,
      input_data: input_data,
    };
    return sendNotification(reqData);
  }

  sendVendorApproved(input_data: {
    vendor_id: string;
    company_id: string;
  }): Promise<SendNotificationResp> {
    const reqData = {
      type_config: notifyTypes.VENDOR_APPROVED,
      input_data: input_data,
    };
    return sendNotification(reqData);
  }
}

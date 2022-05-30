import {
  NotifyTypeConfig,
  SendNotificationResp,
  sendNotification,
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
  PAYOR_AGREEMENT_WITH_CUSTOMER: {
    namespace: "invoice",
    name: "payor_agreement_with_customer",
  },
  PAYOR_APPROVED: {
    namespace: "invoice",
    name: "payor_approved",
  },
};

export class InventoryNotifier {
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

  sendPayorAgreementWithCustomer(input_data: {
    payor_id: string;
    company_id: string;
  }): Promise<SendNotificationResp> {
    const reqData = {
      type_config: notifyTypes.PAYOR_AGREEMENT_WITH_CUSTOMER,
      input_data: input_data,
    };
    return sendNotification(reqData);
  }

  sendPayorApproved(input_data: {
    payor_id: string;
    company_id: string;
  }): Promise<SendNotificationResp> {
    const reqData = {
      type_config: notifyTypes.PAYOR_APPROVED,
      input_data: input_data,
    };
    return sendNotification(reqData);
  }
}

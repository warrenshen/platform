import { ContractFragment } from "generated/graphql";
import { addBizDays } from "lib/date";
import { PaymentMethodEnum } from "lib/enum";

// For a customer, these default values are used when the there is no
// timeline config passed to the computeSettlementDateForPayment function.
export const DefaultSettlementTimelineConfigForCustomer = {
  [PaymentMethodEnum.ACH]: 2,
  [PaymentMethodEnum.ReverseDraftACH]: 2,
  [PaymentMethodEnum.Wire]: 2,
  [PaymentMethodEnum.Check]: 5,
};

// For an advance created by a bank user.
export const SettlementTimelineConfigForBankAdvance = {
  [PaymentMethodEnum.ACH]: 1,
  [PaymentMethodEnum.Wire]: 0,
};

// If someone attempts to pay with a method for which their contract isn't configured
// we need *some* number to add to the payment date to compute the settlement date.
// This value controls that.
const DefaultSettlementDaysFallback = 2;

// The internal field name of the settlement timeline within a product config
const SettlementTimelineConfigProductConfigKey =
  "repayment_type_settlement_timeline";

// Given a contract, traverse the product config to find our settlement timeline
// configuration. Will return an empty object when that field does not exist within
// the product config
export function getSettlementTimelineConfigFromContract(
  contract: ContractFragment | null
) {
  if (!contract) {
    return null;
  }

  const existingContractFields = contract?.product_config.v1.fields;

  const settlmentTimelineConfigRaw =
    existingContractFields.find(
      (field: any) =>
        field.internal_name === SettlementTimelineConfigProductConfigKey
    )?.value || "{}";

  return JSON.parse(settlmentTimelineConfigRaw);
}

// Given a payment method and date use the given timeline config to compute when
// we anticipate the payment will settle
export function computeSettlementDateForPayment(
  paymentMethod: string | null,
  paymentDate: string | null,
  settlementTimelineConfig: any | null
) {
  if (!paymentMethod || !paymentDate) {
    return null;
  }

  const config = !!settlementTimelineConfig
    ? settlementTimelineConfig
    : DefaultSettlementTimelineConfigForCustomer;

  const days =
    paymentMethod in config
      ? config[paymentMethod]
      : DefaultSettlementDaysFallback;
  return addBizDays(paymentDate, days);
}

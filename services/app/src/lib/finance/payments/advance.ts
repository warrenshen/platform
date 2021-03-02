import { ContractFragment } from "generated/graphql";
import { addBizDays } from "lib/date";
import { PaymentMethodEnum } from "lib/enum";

// These default values are used when the there is no timeline config passed to our
// computeSettlementDateForPayment function. Today, we use these values for the bank
// itself as well.
export const DefaultSettlementTimelineConfig = {
  [PaymentMethodEnum.ACH]: 2,
  [PaymentMethodEnum.ReverseDraftACH]: 2,
  [PaymentMethodEnum.Wire]: 2,
  [PaymentMethodEnum.Check]: 2,
  [PaymentMethodEnum.Cash]: 2,
  [PaymentMethodEnum.None]: 2,
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
  paymentMethod: string | null | undefined,
  paymentDate: string | null,
  settlementTimelineConfig: any | null
) {
  if (!paymentMethod || !paymentDate) {
    return null;
  }

  const config = !!settlementTimelineConfig
    ? settlementTimelineConfig
    : DefaultSettlementTimelineConfig;

  const days = config[paymentMethod] || DefaultSettlementDaysFallback;
  return addBizDays(paymentDate, days);
}

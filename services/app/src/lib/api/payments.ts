import {
  Companies,
  Loans,
  Payments,
  PaymentsInsertInput,
} from "generated/graphql";
import {
  authenticatedApi,
  creditsRoutes,
  CustomMutationResponse,
  feesRoutes,
  loansRoutes,
} from "lib/api";

export type CreateAdvanceReq = {
  variables: {
    payment: PaymentsInsertInput;
    loan_ids: Loans["id"][];
    should_charge_wire_fee: boolean;
  };
};

export async function createAdvanceMutation(
  req: CreateAdvanceReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.createAdvance, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not create advance",
        };
      }
    );
}

export type DeleteRepaymentReq = {
  variables: {
    payment_id: Payments["id"];
  };
};

export async function deleteRepaymentMutation(
  req: DeleteRepaymentReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(loansRoutes.deleteRepayment, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not delete repayment",
        };
      }
    );
}

export type CreateAccountLevelFeeReq = {
  variables: {
    company_id: Companies["id"];
    subtype: string;
    amount: number;
    payment_date: string;
    settlement_date: string;
  };
};

export async function createAccountLevelFeeMutation(
  req: CreateAccountLevelFeeReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(feesRoutes.createAccountLevelFee, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not create account fee",
        };
      }
    );
}

export type CreateAccountLevelFeeRepaymentReq = {
  variables: {
    company_id: Companies["id"];
    payment: PaymentsInsertInput;
  };
};

export async function createAccountLevelFeeRepaymentMutation(
  req: CreateAccountLevelFeeRepaymentReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(feesRoutes.createAccountLevelFeeRepayment, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not create account fee repayment",
        };
      }
    );
}

export type ScheduleAccountLevelFeeRepaymentReq = {
  variables: {
    company_id: string;
    payment_id: string;
    amount: number;
    payment_date: string;
    items_covered: any;
    is_line_of_credit: boolean;
  };
};

export async function scheduleAccountLevelFeeRepaymentMutation(
  req: ScheduleAccountLevelFeeRepaymentReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(feesRoutes.scheduleAccountLevelFeeRepayment, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not schedule account fee repayment",
        };
      }
    );
}

export type SettleAccountLevelFeeRepaymentReq = {
  variables: {
    company_id: string;
    payment_id: string;
    amount: number;
    deposit_date: string;
    settlement_date: string;
    items_covered: any;
    is_line_of_credit: boolean;
  };
};

export async function settleAccountLevelFeeRepaymentMutation(
  req: SettleAccountLevelFeeRepaymentReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(feesRoutes.settleAccountLevelFeeRepayment, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not settle account fee repayment",
        };
      }
    );
}

export type CreateHoldingAccountCreditReq = {
  variables: {
    company_id: string;
    amount: number;
    deposit_date: string;
    settlment_date: string;
  };
};

export async function createHoldingAccountCreditMutation(
  req: CreateHoldingAccountCreditReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(creditsRoutes.createCreditForCustomer, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not create holding account credit for customer",
        };
      }
    );
}

export type DisburseCreditToCustomerReq = {
  variables: {
    company_id: string;
    payment_method: string;
    amount: number;
    deposit_date: string;
    settlment_date: string;
  };
};

export async function disburseCreditToCustomerMutation(
  req: DisburseCreditToCustomerReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(creditsRoutes.disburseCreditToCustomer, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not disburse holding account credit to customer",
        };
      }
    );
}

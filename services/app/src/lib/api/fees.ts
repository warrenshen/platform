import { CustomMutationResponse, authenticatedApi, feesRoutes } from "lib/api";

export async function getAllMonthlyInterestFeesDueQuery(req: {
  variables: { date: string };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(feesRoutes.getAllMinimumInterestFeesDue, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not get all monthly minimum fees due",
        };
      }
    );
}

export async function submitMinimumInterestFeesDueMutation(req: {
  variables: any;
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(feesRoutes.submitMinimumInterestFeesDue, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not submit all monthly minimum fees due",
        };
      }
    );
}

export async function getAllMonthEndPaymentsQuery(req: {
  variables: { date: string };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(feesRoutes.getAllMonthEndPayments, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not get all monthly LOC fees due",
        };
      }
    );
}

export async function submitMonthEndPaymentsMutation(req: {
  variables: any;
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(feesRoutes.submitMonthEndPayments, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not submit all monthly LOC fees due",
        };
      }
    );
}

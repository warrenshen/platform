import { authenticatedApi, CustomMutationResponse, feesRoutes } from "lib/api";

export async function getAllMonthlyFeesDueQuery(req: {
  variables: { date: string };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(feesRoutes.getAllMonthlyMinimumFeesDue, req.variables)
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

export async function submitAllMonthlyFeesDueMutation(req: {
  variables: any;
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(feesRoutes.submitAllMonthlyMinimumFeesDue, req.variables)
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

import {
  CustomMutationResponse,
  authenticatedApi,
  reportsRoutes,
} from "lib/api";

export type ReportGenerationReq = {
  variables: {
    isTest: boolean;
    email: String;
    asOfDate: String;
  };
};

export async function sendMonthlySummaryLOCReport(
  req: ReportGenerationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(reportsRoutes.monthlySummaryLOC, req)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not send off monthly LOC customer summary emails",
        };
      }
    );
}

export async function sendMonthlySummaryNonLOCReport(
  req: ReportGenerationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(reportsRoutes.monthlySummaryNonLOC, req)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not send off monthly non-LOC customer summary emails",
        };
      }
    );
}

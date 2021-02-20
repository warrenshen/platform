import { Companies, Contracts, Loans } from "generated/graphql";
import { authenticatedApi, loansRoutes } from "lib/api";

export type Artifact = {
  artifact_id: string;
  total_amount: number;
  amount_remaining: number;
};

export type ListArtifactsResp = {
  status: string;
  msg: string;
  artifacts: Artifact[];
};

export async function listArtifactsForCreateLoan(req: {
  company_id: Companies["id"];
  product_type: Contracts["product_type"];
  loan_id: Loans["id"];
}): Promise<ListArtifactsResp> {
  return authenticatedApi
    .post(loansRoutes.listArtifactsForCreateLoan, req)
    .then((res) => res.data)
    .then(
      (response) => response,
      (error) => {
        console.log("Error", error);
        return {
          status: "ERROR",
          msg:
            "Could not list artifacts for create loan for an unexpected reason",
        };
      }
    );
}

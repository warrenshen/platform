import { Companies, CustomerSurveillanceResults } from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  customerSurveillanceRoutes,
} from "lib/api";
import { QualifyForEnum } from "lib/enum";

export type CertifyCustomerSurveillanceResultReq = {
  variables: {
    company_id: Companies["id"];
    surveillance_status: string;
    surveillance_info: Record<string, boolean | string>;
    surveillance_status_note: string;
    qualifying_product: { [key in QualifyForEnum]: boolean | null };
    qualifying_date: string;
  };
};

export async function certifyCustomerSurveillanceResultMutation(
  req: CertifyCustomerSurveillanceResultReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(customerSurveillanceRoutes.certifySurveillanceResult, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not certify surveillance status",
        };
      }
    );
}

export type DeleteCustomerSurveillanceResultReq = {
  variables: {
    surveillance_result_id: CustomerSurveillanceResults["id"];
  };
};

export async function deleteCustomerSurveillanceResultMutation(
  req: DeleteCustomerSurveillanceResultReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(customerSurveillanceRoutes.deleteSurveillanceResult, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not delete surveillance result",
        };
      }
    );
}

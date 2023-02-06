import {
  CompanyPayorPartnerships,
  CompanyVendorPartnerships,
  Users,
} from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  partnershipRoutes,
} from "lib/api";

export type UpdatePartnershipContactsReq = {
  variables: {
    is_payor: boolean;
    partnership_id:
      | CompanyPayorPartnerships["id"]
      | CompanyVendorPartnerships["id"];
    user_ids: Users["id"][];
  };
};

export async function updatePartnershipContactsMutation(
  req: UpdatePartnershipContactsReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(partnershipRoutes.updatePartnershipContacts, req.variables)
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
          msg: "Could not update partnership contacts",
        };
      }
    );
}

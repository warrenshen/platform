import { CompanySettings, Users } from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  companySettingsRoutes,
} from "lib/api";
import { FeatureFlagEnum } from "lib/enum";

export type UpdateCustomerSettingsMutationReq = {
  variables: {
    company_settings_id: CompanySettings["id"];
    is_autogenerate_repayments_enabled: boolean;
    has_autofinancing: boolean;
    vendor_agreement_docusign_template: string;
    vendor_onboarding_link: string;
    payor_agreement_docusign_template: string;
  };
};

export async function updateCustomerSettingsMutation(
  req: UpdateCustomerSettingsMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companySettingsRoutes.updateCustomerSettings, req.variables)
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
          msg: "Could not update company settings",
        };
      }
    );
}

export type UpsertFeatureFlagsMutationReq = {
  variables: {
    company_settings_id: CompanySettings["id"];
    feature_flags_payload: { [key in FeatureFlagEnum]: boolean | null };
  };
};

export async function upsertFeatureFlagsMutation(
  req: UpsertFeatureFlagsMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companySettingsRoutes.upsertFeatureFlags, req.variables)
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
          msg: "Could not update company features",
        };
      }
    );
}

export type UpsertDealOwnerMutationReq = {
  variables: {
    company_settings_id: CompanySettings["id"];
    client_success_user_id: Users["id"] | null;
    business_development_user_id: Users["id"] | null;
    underwriter_user_id: Users["id"] | null;
  };
};

export async function upsertDealOwnerMutation(
  req: UpsertDealOwnerMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companySettingsRoutes.upsertDealOwner, req.variables)
    .then((res) => res.data)
    .then(
      (response) => response,
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not update company deal owner",
        };
      }
    );
}

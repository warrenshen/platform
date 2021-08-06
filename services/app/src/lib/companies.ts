import {
  Companies,
  CompanyFragment,
  CompanySettingsLimitedFragment,
  Payors,
  Vendors,
} from "generated/graphql";
import {
  CustomerUserRoles,
  CustomMessageEnum,
  FeatureFlagEnum,
  PartnerCompanyUserRoles,
} from "lib/enum";

export function getCompanyDisplayName(
  company?:
    | Pick<Companies, "id" | "name" | "dba_name">
    | Pick<Payors, "id" | "name" | "dba_name">
    | Pick<Vendors, "id" | "name" | "dba_name">
    | null
) {
  if (!company) {
    return "Unknown";
  } else {
    return !!company.dba_name
      ? `${company.name} (DBA ${company.dba_name})`
      : company.name || "Unkown";
  }
}

export function getCompanyUserRolesForCompany(company: CompanyFragment) {
  return [
    ...(company.is_customer ? CustomerUserRoles : []),
    ...(company.is_payor || company.is_vendor ? PartnerCompanyUserRoles : []),
  ];
}

export enum FeatureFlagConfigs {
  Name = "name",
  Description = "description",
}

const FeatureFlagToConfigs = {
  [FeatureFlagEnum.CREATE_PURCHASE_ORDER_FROM_METRC_TRANSFERS]: {
    [FeatureFlagConfigs.Name]: "Create purchase order from Metrc transfers",
    [FeatureFlagConfigs.Description]:
      "If enabled, customer user will be able to create a purchase order from Metrc transfers if other requirements are met (other requirements: Metrc API key is set up and functioning correctly).",
  },
};

export function getFeatureFlagName(featureFlag: FeatureFlagEnum) {
  if (!FeatureFlagToConfigs[featureFlag]) {
    console.error(`Unknown feature flag "${featureFlag}", returning "".`);
    return "";
  } else {
    return FeatureFlagToConfigs[featureFlag][FeatureFlagConfigs.Name];
  }
}

export function getFeatureFlagDescription(featureFlag: FeatureFlagEnum) {
  if (!FeatureFlagToConfigs[featureFlag]) {
    console.error(`Unknown feature flag "${featureFlag}", returning "".`);
    return "";
  } else {
    return FeatureFlagToConfigs[featureFlag][FeatureFlagConfigs.Description];
  }
}

export function isFeatureFlagEnabled(
  companySettings: CompanySettingsLimitedFragment,
  featureFlag: FeatureFlagEnum
) {
  // Note: feature_flags_payload attribute (JSON type) may be null.
  return (
    !!companySettings.feature_flags_payload &&
    !!companySettings.feature_flags_payload[featureFlag]
  );
}

export enum CustomMessageConfigs {
  Name = "name",
}

const CustomMessageToConfigs = {
  [CustomMessageEnum.OVERVIEW_PAGE]: {
    [CustomMessageConfigs.Name]:
      'Message for customer on "Overview" page banner ',
  },
};

export function getCustomMessageName(customMessage: CustomMessageEnum) {
  if (!CustomMessageToConfigs[customMessage]) {
    console.error(`Unknown custom message "${customMessage}", returning "".`);
    return "";
  } else {
    return CustomMessageToConfigs[customMessage][CustomMessageConfigs.Name];
  }
}

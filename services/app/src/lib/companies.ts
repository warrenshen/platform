import {
  Companies,
  CompanyFragment,
  CompanySettingsLimitedFragment,
  Payors,
  Vendors,
} from "generated/graphql";
import {
  CustomMessageEnum,
  CustomerUserRoles,
  FeatureFlagEnum,
  PartnerCompanyUserRoles,
} from "lib/enum";

export function getCompanyDisplayName(
  company?:
    | Pick<Companies, "id" | "name" | "dba_name">
    | Pick<Payors, "id" | "name" | "dba_name">
    | Pick<Vendors, "id" | "name" | "dba_name">
    | null,
  defaultIfNull: string = "Unknown"
) {
  if (!company) {
    return defaultIfNull;
  } else {
    return !!company.dba_name
      ? `${company.name} (DBA ${company.dba_name})`
      : company.name || "Unknown";
  }
}

export function getCompanyUserRolesForCompany(company: CompanyFragment) {
  return [
    ...(company.is_customer ? CustomerUserRoles : []),
    ...(company.is_payor || company.is_vendor ? PartnerCompanyUserRoles : []),
  ];
}

export function getCompanyUserRolesFromChildCompanies(
  companies: CompanyFragment[]
) {
  const customers = companies.filter((company) => company.is_customer) || [];
  const partners =
    companies.filter((company) => company.is_payor || company.is_vendor) || [];

  const customerRoles = !!customers?.[0] ? CustomerUserRoles : [];
  const partnerUserRoles = !!partners?.[0] ? PartnerCompanyUserRoles : [];

  return partnerUserRoles.concat(customerRoles);
}

export enum FeatureFlagConfigs {
  Name = "name",
  Description = "description",
}

const FeatureFlagToConfigs = {
  [FeatureFlagEnum.CreatePurchaseOrderFromMetrcTransfers]: {
    [FeatureFlagConfigs.Name]: "Create purchase order from Metrc transfers",
    [FeatureFlagConfigs.Description]:
      "If enabled, customer user will be able to create a purchase order from Metrc transfers if other requirements are met (other requirements: Metrc API key is set up and functioning correctly).",
  },
  [FeatureFlagEnum.ReportingRequirementsCategory]: {
    [FeatureFlagConfigs.Name]: "Reporting Requirements",
    [FeatureFlagConfigs.Description]:
      "The selection made here determines the financial reporting requirements for this client.",
  },
  [FeatureFlagEnum.OverrideRepaymentAutogeneration]: {
    [FeatureFlagConfigs.Name]: "Override repayment auto-generation",
    [FeatureFlagConfigs.Description]:
      "If enabled, repayments will not be auto-generated for clients that have opted in to this feature. If they haven't opted in, this flag will do nothing.",
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

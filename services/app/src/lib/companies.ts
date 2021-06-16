import { CompanySettingsLimitedFragment } from "generated/graphql";
import { FeatureFlagEnum } from "lib/enum";

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
  return !!companySettings.feature_flags_payload[featureFlag];
}

import { CompanySettingsLimitedFragment } from "generated/graphql";
import { FeatureFlagEnum } from "lib/enum";

export function isFeatureFlagEnabled(
  companySettings: CompanySettingsLimitedFragment,
  featureFlag: FeatureFlagEnum
) {
  return !!companySettings.feature_flags_payload[featureFlag];
}

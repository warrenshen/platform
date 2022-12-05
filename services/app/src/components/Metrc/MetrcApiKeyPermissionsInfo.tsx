import MetrcApiKeyPermissionsDataGrid from "components/Metrc/MetrcApiKeyPermissionsDataGrid";
import { useGetCompanyLicensesByLicenseNumbersQuery } from "generated/graphql";
import { MetrcApiKeyPermissions } from "lib/api/metrc";
import { useMemo } from "react";

interface Props {
  metrcApiKeyPermissions: MetrcApiKeyPermissions;
}

export default function MetrcApiKeyPermissionsInfo({
  metrcApiKeyPermissions,
}: Props) {
  const licenseNumbers = useMemo(
    () =>
      metrcApiKeyPermissions.map(
        (metrcApiKeyLicensePermissions) =>
          metrcApiKeyLicensePermissions["license_number"]
      ),
    [metrcApiKeyPermissions]
  );

  const { data, error } = useGetCompanyLicensesByLicenseNumbersQuery({
    fetchPolicy: "network-only",
    variables: {
      license_numbers: licenseNumbers,
    },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  const companyLicenses = data?.company_licenses || [];
  const enhancedMetrcApiKeyPermissions = metrcApiKeyPermissions.map(
    (metrcApiKeyLicensePermissions) => {
      const licenseNumber = metrcApiKeyLicensePermissions["license_number"];
      const matchingCompanyLicense = companyLicenses.find(
        (companyLicense) => companyLicense.license_number === licenseNumber
      );
      return {
        ...metrcApiKeyLicensePermissions,
        us_state: matchingCompanyLicense?.us_state,
        legal_name: matchingCompanyLicense?.legal_name,
        license_category: matchingCompanyLicense?.license_category,
        license_description: matchingCompanyLicense?.license_category,
        license_status: matchingCompanyLicense?.license_status,
      };
    }
  );

  return (
    <MetrcApiKeyPermissionsDataGrid
      enhancedMetrcApiKeyPermissions={enhancedMetrcApiKeyPermissions}
    />
  );
}

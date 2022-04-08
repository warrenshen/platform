import { Box, Typography } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import AddVendorButton from "components/Vendors/AddVendorButton";
import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import Can from "components/Shared/Can";
import { Action } from "lib/auth/rbac-rules";
import {
  Companies,
  CompanyTypeEnum,
  useGetPartnershipRequestsForBankByRequestingCompanyIdAndTypeSubscription,
  useGetVendorPartnershipsByCompanyIdQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { ProductTypeEnum } from "lib/enum";
import { isVendorAgreementProductType } from "lib/settings";
import { sortBy } from "lodash";
import { useMemo } from "react";
import AwaitingPartnershipsDataGrid from "components/Partnerships/AwaitingPartnershipsDataGrid";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

export default function CustomerVendorsPageContent({
  companyId,
  productType,
}: Props) {
  const { data, refetch, error } = useGetVendorPartnershipsByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }
  const {
    data: awaitingPartnershipsData,
    error: awaitingPartnershipsError,
  } = useGetPartnershipRequestsForBankByRequestingCompanyIdAndTypeSubscription({
    fetchPolicy: "network-only",
    variables: {
      requesting_company_id: companyId,
      company_type: CompanyTypeEnum.Vendor,
    },
  });

  if (awaitingPartnershipsError) {
    console.error({ error });
    alert(
      `Error in query (details in console): ${awaitingPartnershipsError.message}`
    );
  }

  const awaitingPartnershipRequests = useMemo(
    () => awaitingPartnershipsData?.company_partnership_requests || [],
    [awaitingPartnershipsData?.company_partnership_requests]
  );

  const vendorPartnerships = sortBy(
    data?.company_vendor_partnerships || [],
    (companyVendorPartnership) =>
      getCompanyDisplayName(companyVendorPartnership.vendor)
  );

  return (
    <PageContent title={"Vendors"}>
      {awaitingPartnershipRequests.length > 0 && (
        <>
          <Box mb={2}>
            <Typography variant="h6">
              <strong>Awaiting Approval</strong>
            </Typography>
          </Box>
          <Box display="grid">
            <AwaitingPartnershipsDataGrid
              partnershipRequests={awaitingPartnershipRequests}
            />
          </Box>
        </>
      )}
      <h2>Approved</h2>
      <Can perform={Action.AddVendor}>
        <Box display="flex" flexDirection="row-reverse" mb={2}>
          <AddVendorButton customerId={companyId} handleDataChange={refetch} />
        </Box>
      </Can>
      <Box display="flex">
        <VendorPartnershipsDataGrid
          isVendorAgreementVisible={isVendorAgreementProductType(productType)}
          vendorPartnerships={vendorPartnerships}
        />
      </Box>
    </PageContent>
  );
}

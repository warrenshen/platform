import { Box } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import AddVendorButton from "components/Vendors/AddVendorButton";
import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import Can from "components/Shared/Can";
import { Action } from "lib/auth/rbac-rules";
import {
  Companies,
  useGetVendorPartnershipsByCompanyIdQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { ProductTypeEnum } from "lib/enum";
import { isVendorAgreementProductType } from "lib/settings";
import { sortBy } from "lodash";

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

  const vendorPartnerships = sortBy(
    data?.company_vendor_partnerships || [],
    (companyVendorPartnership) =>
      getCompanyDisplayName(companyVendorPartnership.vendor)
  );

  return (
    <PageContent title={"Vendors"}>
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

import { Box } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import AddVendorButton from "components/Vendors/AddVendorButton";
import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import {
  Companies,
  useGetVendorPartnershipsByCompanyIdQuery,
} from "generated/graphql";
import { sortBy } from "lodash";

interface Props {
  companyId: Companies["id"];
}

export default function CustomerVendorsPageContent({ companyId }: Props) {
  const { data, refetch, error } = useGetVendorPartnershipsByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.log({ error });
  }

  const vendorPartnerships = sortBy(
    data?.company_vendor_partnerships || [],
    (companyVendorPartnership) => companyVendorPartnership.vendor_limited?.name
  );

  return (
    <PageContent title={"Vendors"}>
      <Box display="flex" flexDirection="row-reverse">
        <AddVendorButton customerId={companyId} handleDataChange={refetch} />
      </Box>
      <Box display="flex" mt={3}>
        <VendorPartnershipsDataGrid vendorPartnerships={vendorPartnerships} />
      </Box>
    </PageContent>
  );
}

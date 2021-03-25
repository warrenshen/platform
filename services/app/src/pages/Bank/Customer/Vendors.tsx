import { Box } from "@material-ui/core";
import AddVendorButton from "components/Vendors/AddVendorButton";
import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import { useGetVendorPartnershipsByCompanyIdQuery } from "generated/graphql";
import { sortBy } from "lodash";

interface Props {
  companyId: string;
}

function Vendors({ companyId }: Props) {
  const { data, refetch } = useGetVendorPartnershipsByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  if (!data || !data.company_vendor_partnerships) {
    return null;
  }

  const vendorPartnerships = sortBy(
    data.company_vendor_partnerships,
    (item) => item.vendor.name
  );

  return (
    <Box>
      <Box
        display="flex"
        style={{ marginBottom: "1rem" }}
        flexDirection="row-reverse"
      >
        <AddVendorButton customerId={companyId} handleDataChange={refetch} />
      </Box>
      <Box display="flex" flexWrap="wrap">
        <VendorPartnershipsDataGrid
          isBankUserRole
          isDrilldownByCustomer
          isExcelExport
          vendorPartnerships={vendorPartnerships}
        />
      </Box>
    </Box>
  );
}

export default Vendors;

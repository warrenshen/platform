import Page from "components/Shared/Page";
import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import { useGetVendorPartnershipsForBankQuery } from "generated/graphql";
import { sortBy } from "lodash";

function BankVendorsPage() {
  const { data } = useGetVendorPartnershipsForBankQuery();

  const partnerships = data?.company_vendor_partnerships || [];
  const vendorPartnerships = sortBy(partnerships, (item) => item.vendor.name);

  return (
    <Page appBarTitle={"Vendors"}>
      <VendorPartnershipsDataGrid
        isBankUserRole
        isExcelExport
        vendorPartnerships={vendorPartnerships}
      />
    </Page>
  );
}

export default BankVendorsPage;

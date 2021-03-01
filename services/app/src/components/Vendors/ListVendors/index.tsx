import VendorPartnershipList from "components/Vendors/VendorPartnershipsDataGrid";
import { useBankListVendorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";

function ListVendors() {
  const { data }: { data: any } = useBankListVendorPartnershipsQuery();

  if (!data || !data.company_vendor_partnerships) {
    return null;
  }

  const vendorPartnerships = sortBy(
    data.company_vendor_partnerships,
    (item) => item.vendor.name
  );

  return <VendorPartnershipList data={vendorPartnerships} isBankAccount />;
}

export default ListVendors;

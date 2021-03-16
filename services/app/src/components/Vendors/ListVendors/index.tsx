import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import { useBankListVendorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";

function ListVendors() {
  const { data }: { data: any } = useBankListVendorPartnershipsQuery();

  const partnerships = data?.company_vendor_partnerships || [];

  const vendors = sortBy(partnerships, (item) => item.vendor.name);

  return <VendorPartnershipsDataGrid data={vendors} isBankAccount />;
}

export default ListVendors;

import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import { useBankListVendorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";

interface Props {
  isExcelExport?: boolean;
}

function ListVendors({ isExcelExport = false }: Props) {
  const { data }: { data: any } = useBankListVendorPartnershipsQuery();

  const partnerships = data?.company_vendor_partnerships || [];

  const vendors = sortBy(partnerships, (item) => item.vendor.name);

  return (
    <VendorPartnershipsDataGrid
      data={vendors}
      isExcelExport={isExcelExport}
      isBankAccount
    />
  );
}

export default ListVendors;

import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useListVendorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";
import { useContext } from "react";
import VendorPartnershipList from "../../VendorPartnershipList";

function ListVendors() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);
  const { data } = useListVendorPartnershipsQuery({
    variables: {
      companyId,
    },
  });

  if (!data || !data.company_vendor_partnerships) {
    return null;
  }

  const vendorPartnerships = sortBy(
    data.company_vendor_partnerships,
    (item) => item.vendor_limited?.name
  );

  return (
    <div style={{ marginTop: "1rem" }}>
      <VendorPartnershipList data={vendorPartnerships} />
    </div>
  );
}

export default ListVendors;

import VendorDrawer from "components/Vendors/Bank/VendorDrawer";
import VendorCard from "components/Vendors/VendorCard";
import {
  BankVendorPartnershipFragment,
  VendorFragment,
} from "generated/graphql";
import { useState } from "react";

function ClickableVendorCard(props: {
  vendorPartnership: BankVendorPartnershipFragment & { vendor: VendorFragment };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <VendorDrawer
          vendorPartnershipId={props.vendorPartnership.id}
          onClose={() => setOpen(false)}
        ></VendorDrawer>
      )}
      <VendorCard
        vendorPartnership={props.vendorPartnership}
        vendor={props.vendorPartnership.vendor}
        onClick={() => {
          setOpen(true);
        }}
      ></VendorCard>
    </>
  );
}

export default ClickableVendorCard;

import VendorCard from "components/Vendors/VendorCard";
import VendorDrawer from "components/Vendors/VendorDrawer";
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
        vendorBankAccountVerifiedAt={
          props.vendorPartnership.vendor_bank_account?.verified_at
        }
        onClick={() => {
          setOpen(true);
        }}
      ></VendorCard>
    </>
  );
}

export default ClickableVendorCard;

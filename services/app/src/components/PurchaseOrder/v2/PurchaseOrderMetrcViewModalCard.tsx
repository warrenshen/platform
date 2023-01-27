import CardContainer from "components/Shared/Card/CardContainer";
import ModalDataPoint from "components/Shared/Modal/ModalDataPoint";
import Text, { TextVariants } from "components/Shared/Text/Text";
import MetrcTransferDrawer from "components/Transfers/v2/MetrcTransferDrawer";
import {
  Companies,
  PurchaseOrderMetrcTransferWithRelationshipsFragment,
} from "generated/graphql";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  metrcTransfer: PurchaseOrderMetrcTransferWithRelationshipsFragment;
}

export default function PurchaseOrderViewModalCard({
  companyId,
  metrcTransfer,
}: Props) {
  const [isMetrcTransferDrawerOpen, setIsMetrcTransferDrawerOpen] =
    useState<boolean>(false);

  const manifestNumber = !!metrcTransfer?.metrc_transfer?.manifest_number
    ? metrcTransfer.metrc_transfer.manifest_number
    : "";
  const recipientFacilityLicenseNumber = !!metrcTransfer?.metrc_transfer
    ?.transfer_payload?.RecipientFacilityLicenseNumber
    ? metrcTransfer.metrc_transfer.transfer_payload
        .RecipientFacilityLicenseNumber
    : "";
  const shipperFacilityLicenseNumber = !!metrcTransfer?.metrc_transfer
    ?.transfer_payload?.ShipperFacilityLicenseNumber
    ? metrcTransfer.metrc_transfer.transfer_payload.ShipperFacilityLicenseNumber
    : "";
  const packageCount = !!metrcTransfer?.metrc_transfer?.transfer_payload
    ?.PackageCount
    ? metrcTransfer.metrc_transfer.transfer_payload.PackageCount
    : "";
  const labResult = !!metrcTransfer?.metrc_transfer?.lab_results_status
    ? metrcTransfer.metrc_transfer.lab_results_status
    : "";

  return (
    <>
      {isMetrcTransferDrawerOpen && (
        <MetrcTransferDrawer
          metrcTransferId={metrcTransfer.metrc_transfer.id}
          handleClose={() => setIsMetrcTransferDrawerOpen(false)}
        />
      )}
      <CardContainer>
        <Text
          materialVariant="h3"
          isBold
          textVariant={TextVariants.SubHeader}
          bottomMargin={22}
          handleClick={() => setIsMetrcTransferDrawerOpen(true)}
        >
          {manifestNumber}
        </Text>
        <ModalDataPoint
          subtitle={"License from / to"}
          text={`${shipperFacilityLicenseNumber} -> ${recipientFacilityLicenseNumber}`}
        />
        <ModalDataPoint subtitle={"Package(s) count"} text={packageCount} />
        <ModalDataPoint subtitle={"Lab result"} text={labResult} />
      </CardContainer>
    </>
  );
}

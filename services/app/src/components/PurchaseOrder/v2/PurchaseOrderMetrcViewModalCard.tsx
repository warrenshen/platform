import CardContainer from "components/Shared/Card/CardContainer";
import ModalDataPoint from "components/Shared/Modal/ModalDataPoint";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  PurchaseOrderMetrcTransferWithRelationshipsFragment,
} from "generated/graphql";
import { formatDatetimeString } from "lib/date";
import {
  BankCompanyRouteEnum,
  bankRoutes,
  getBankCompanyRoute,
} from "lib/routes";
import { useContext } from "react";
import { useHistory } from "react-router-dom";

interface Props {
  companyId: Companies["id"];
  metrcTransfer: PurchaseOrderMetrcTransferWithRelationshipsFragment;
}

export default function PurchaseOrderViewModalCard({
  companyId,
  metrcTransfer,
}: Props) {
  const history = useHistory();
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

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
  const receivedDateTime = !!metrcTransfer?.metrc_transfer?.transfer_payload
    ?.ReceivedDateTime
    ? metrcTransfer.metrc_transfer.transfer_payload.ReceivedDateTime
    : "";
  const packageCount = !!metrcTransfer?.metrc_transfer?.transfer_payload
    ?.PackageCount
    ? metrcTransfer.metrc_transfer.transfer_payload.PackageCount
    : "";
  const labResult = !!metrcTransfer?.metrc_transfer?.lab_results_status
    ? metrcTransfer.metrc_transfer.lab_results_status
    : "";

  return (
    <CardContainer>
      <Text
        materialVariant="h3"
        isBold
        textVariant={TextVariants.SubHeader}
        bottomMargin={22}
        handleClick={() => {
          history.push(
            isBankUser
              ? bankRoutes.metrcRoot
              : getBankCompanyRoute(companyId, BankCompanyRouteEnum.Loans)
          );
        }}
      >
        {manifestNumber}
      </Text>
      <ModalDataPoint
        subtitle={"License from / to"}
        text={`${shipperFacilityLicenseNumber} -> ${recipientFacilityLicenseNumber}`}
      />
      <ModalDataPoint
        subtitle={"Received at"}
        text={formatDatetimeString(receivedDateTime, true)}
      />
      <ModalDataPoint subtitle={"Package(s) count"} text={packageCount} />
      <ModalDataPoint subtitle={"Lab result"} text={labResult} />
    </CardContainer>
  );
}

import CardContainer from "components/Shared/Card/CardContainer";
import CardLine from "components/Shared/Card/CardLine";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { GetMetrcTransferQuery } from "generated/graphql";
import { formatDatetimeString } from "lib/date";

interface Props {
  metrcTransfer: GetMetrcTransferQuery["metrc_transfers_by_pk"];
}

export default function MetrcTransferManifestCard({ metrcTransfer }: Props) {
  const transferPayload = metrcTransfer?.transfer_payload || {};

  return (
    <CardContainer>
      <Text isBold textVariant={TextVariants.SubHeader} bottomMargin={22}>
        {metrcTransfer?.manifest_number}
      </Text>
      <CardLine
        labelText={"Last modified date time (in Metrc)"}
        valueText={transferPayload.LastModified}
      />
      <CardLine
        labelText={"Shipper facility name"}
        valueText={transferPayload.ShipperFacilityName}
      />
      <CardLine
        labelText={"Recipient facility name"}
        valueText={transferPayload.RecipientFacilityName}
      />
      <CardLine
        labelText={"Estimated departure time"}
        valueText={
          formatDatetimeString(transferPayload.EstimatedDepartureDateTime) ||
          "-"
        }
      />
      <CardLine
        labelText={"Estimated arrival time"}
        valueText={
          formatDatetimeString(transferPayload.EstimatedArrivalDateTime) || "-"
        }
      />
    </CardContainer>
  );
}

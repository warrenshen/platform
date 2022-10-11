import CardContainer from "components/Shared/Card/CardContainer";
import CardLine from "components/Shared/Card/CardLine";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { GetMetrcTransferPackageQuery } from "generated/graphql";

interface Props {
  metrcPackage: GetMetrcTransferPackageQuery["metrc_transfer_packages_by_pk"];
}

export default function MetrcPackageInformationCard({ metrcPackage }: Props) {
  const packagePayload = metrcPackage?.package_payload;

  return (
    <CardContainer>
      <Text isBold textVariant={TextVariants.SubHeader} bottomMargin={22}>
        {metrcPackage?.package_label}
      </Text>
      <CardLine
        labelText={"Package ID (Metrc)"}
        valueText={metrcPackage?.package_id || "-"}
      />
      <CardLine
        labelText={"Package label"}
        valueText={metrcPackage?.package_label || "-"}
      />
      <CardLine
        labelText={"Product name"}
        valueText={packagePayload.ProductName}
      />
      <CardLine
        labelText={"Product category"}
        valueText={packagePayload.ProductCategoryName}
      />
      <CardLine
        labelText={"Shipped quantity"}
        valueText={`${packagePayload.ShippedQuantity} (${packagePayload.ShippedUnitOfMeasureName})`}
      />
      <CardLine
        labelText={"Received quantity"}
        valueText={`${packagePayload.ReceivedQuantity} (${packagePayload.ReceivedUnitOfMeasureName})`}
      />
    </CardContainer>
  );
}

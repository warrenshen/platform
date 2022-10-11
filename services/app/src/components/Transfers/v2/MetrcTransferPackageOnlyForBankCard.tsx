import { Box } from "@material-ui/core";
import CardContainer from "components/Shared/Card/CardContainer";
import CardLine from "components/Shared/Card/CardLine";
import {
  DisabledSecondaryTextColor,
  TextColor,
} from "components/Shared/Colors/GlobalColors";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  GetMetrcTransferPackageQuery,
  GetMetrcTransferQuery,
} from "generated/graphql";
import { useState } from "react";

function isMetricTransfer(
  obj: any
): obj is GetMetrcTransferQuery["metrc_transfers_by_pk"] {
  return obj.transfer_payload !== undefined;
}

interface Props {
  metrcTransferOrPackage:
    | GetMetrcTransferQuery["metrc_transfers_by_pk"]
    | GetMetrcTransferPackageQuery["metrc_transfer_packages_by_pk"];
}

export default function MetrcTransferPackageOnlyForBankCard({
  metrcTransferOrPackage,
}: Props) {
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  const jsonPayload = isMetricTransfer(metrcTransferOrPackage)
    ? metrcTransferOrPackage?.transfer_payload
    : metrcTransferOrPackage?.package_payload;
  return (
    <CardContainer>
      <CardLine
        labelText={"Platform ID"}
        valueText={metrcTransferOrPackage?.id}
      />
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        width={"100%"}
        mb={"16px"}
      >
        <Text
          textVariant={TextVariants.Label}
          color={DisabledSecondaryTextColor}
          bottomMargin={0}
        >
          {"Raw Transfer JSON"}
        </Text>
        <Box maxWidth={"80%"}>
          <Text
            textVariant={TextVariants.Label}
            color={TextColor}
            alignment={"right"}
            bottomMargin={0}
            handleClick={() => setIsJsonOpen(!isJsonOpen)}
          >
            {isJsonOpen ? "Hide" : "View"}
          </Text>
        </Box>
      </Box>
      <Box overflow={"scroll"}>
        {isJsonOpen && <pre>{JSON.stringify(jsonPayload, null, 2)}</pre>}
      </Box>
    </CardContainer>
  );
}

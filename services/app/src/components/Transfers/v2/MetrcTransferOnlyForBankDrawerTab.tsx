import { Box } from "@material-ui/core";
import TabContainer from "components/Shared/Tabs/TabContainer";
import MetrcTransferPackageOnlyForBankCard from "components/Transfers/v2/MetrcTransferPackageOnlyForBankCard";
import { GetMetrcTransferQuery } from "generated/graphql";

interface Props {
  metrcTransfer: GetMetrcTransferQuery["metrc_transfers_by_pk"];
}

const MetrcTransferOnlyForBankDrawerTab = ({ metrcTransfer }: Props) => {
  return (
    <TabContainer>
      <Box width={600} ml={25}>
        <MetrcTransferPackageOnlyForBankCard
          metrcTransferOrPackage={metrcTransfer}
        />
      </Box>
    </TabContainer>
  );
};

export default MetrcTransferOnlyForBankDrawerTab;

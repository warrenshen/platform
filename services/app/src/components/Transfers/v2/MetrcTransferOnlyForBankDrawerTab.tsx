import TabContainer from "components/Shared/Tabs/TabContainer";
import MetrcTransferPackageOnlyForBankCard from "components/Transfers/v2/MetrcTransferPackageOnlyForBankCard";
import { GetMetrcTransferQuery } from "generated/graphql";

interface Props {
  metrcTransfer: GetMetrcTransferQuery["metrc_transfers_by_pk"];
}

const MetrcTransferOnlyForBankDrawerTab = ({ metrcTransfer }: Props) => {
  return (
    <TabContainer>
      <MetrcTransferPackageOnlyForBankCard
        metrcTransferOrPackage={metrcTransfer}
      />
    </TabContainer>
  );
};

export default MetrcTransferOnlyForBankDrawerTab;

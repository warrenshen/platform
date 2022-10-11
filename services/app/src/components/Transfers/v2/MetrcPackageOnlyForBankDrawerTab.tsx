import { Box } from "@material-ui/core";
import TabContainer from "components/Shared/Tabs/TabContainer";
import MetrcTransferPackageOnlyForBankCard from "components/Transfers/v2/MetrcTransferPackageOnlyForBankCard";
import { GetMetrcTransferPackageQuery } from "generated/graphql";

interface Props {
  metrcPackage: GetMetrcTransferPackageQuery["metrc_transfer_packages_by_pk"];
}

const MetrcPackageOnlyForBankDrawerTab = ({ metrcPackage }: Props) => {
  return (
    <TabContainer>
      <Box width={600}>
        <MetrcTransferPackageOnlyForBankCard
          metrcTransferOrPackage={metrcPackage}
        />
      </Box>
    </TabContainer>
  );
};

export default MetrcPackageOnlyForBankDrawerTab;

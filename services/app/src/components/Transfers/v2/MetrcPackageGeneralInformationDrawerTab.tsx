import TabContainer from "components/Shared/Tabs/TabContainer";
import MetrcPackageInformationCard from "components/Transfers/v2/MetrcPackageInformationCard";
import { GetMetrcTransferPackageQuery } from "generated/graphql";

interface Props {
  metrcPackage: GetMetrcTransferPackageQuery["metrc_transfer_packages_by_pk"];
}

const MetrcPackageGeneralInformationDrawerTab = ({ metrcPackage }: Props) => {
  return (
    <TabContainer>
      <MetrcPackageInformationCard metrcPackage={metrcPackage} />
    </TabContainer>
  );
};

export default MetrcPackageGeneralInformationDrawerTab;

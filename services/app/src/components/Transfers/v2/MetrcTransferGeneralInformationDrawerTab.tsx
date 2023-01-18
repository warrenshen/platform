import { Box } from "@material-ui/core";
import TabContainer from "components/Shared/Tabs/TabContainer";
import Text, { TextVariants } from "components/Shared/Text/Text";
import MetrcDeliveriesDataGrid from "components/Transfers/MetrcDeliveriesDataGrid";
import MetrcTransferPackagesDataGrid from "components/Transfers/v2/MetrcTransferPackagesDataGrid";
import { GetMetrcTransferQuery } from "generated/graphql";

import MetrcTransferManifestCard from "./MetrcTransferManifestCard";

interface Props {
  metrcTransfer: GetMetrcTransferQuery["metrc_transfers_by_pk"];
  isBankUser: boolean;
}

const MetrcTransferGeneralInformationDrawerTab = ({
  metrcTransfer,
  isBankUser,
}: Props) => {
  const metrcTransferPackages = metrcTransfer?.metrc_transfer_packages || [];
  const metrcDeliveries = metrcTransfer?.metrc_deliveries || [];
  return (
    <TabContainer width={1000}>
      <Box width={600} ml={25} mb={3}>
        <MetrcTransferManifestCard metrcTransfer={metrcTransfer} />
      </Box>
      <>
        {metrcDeliveries.length > 0 && (
          <Box mb={2}>
            <Text textVariant={TextVariants.ParagraphLead} bottomMargin={2}>
              {`Deliveries (${metrcDeliveries.length})`}
            </Text>
            <MetrcDeliveriesDataGrid metrcDeliveries={metrcDeliveries} />
          </Box>
        )}
      </>
      <Box>
        {metrcTransferPackages.length > 0 && (
          <>
            <Text textVariant={TextVariants.ParagraphLead} bottomMargin={2}>
              {`Packages (${metrcTransferPackages.length})`}
            </Text>
            <MetrcTransferPackagesDataGrid
              isViewActionAvailable={isBankUser}
              metrcTransferPackages={metrcTransferPackages}
            />
          </>
        )}
      </Box>
    </TabContainer>
  );
};

export default MetrcTransferGeneralInformationDrawerTab;

import { Tab, Tabs } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import MetrcPackageGeneralInformationDrawerTab from "components/Transfers/v2/MetrcPackageGeneralInformationDrawerTab";
import MetrcPackageOnlyForBankDrawerTab from "components/Transfers/v2/MetrcPackageOnlyForBankDrawerTab";
import {
  MetrcPackages,
  useGetMetrcTransferPackageQuery,
} from "generated/graphql";
import { MetrcTransferDrawerTabLabel } from "lib/enum";
import { useState } from "react";

interface Props {
  metrcPackageId: MetrcPackages["id"];
  isBankUser: boolean;
  handleClose: () => void;
}

const MetrcPackageDrawer = ({
  metrcPackageId,
  isBankUser,
  handleClose,
}: Props) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const { data, error } = useGetMetrcTransferPackageQuery({
    fetchPolicy: "network-only",
    variables: {
      id: metrcPackageId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const metrcPackage = data?.metrc_transfer_packages_by_pk;

  if (!metrcPackage) {
    return null;
  }

  return (
    <Modal
      title={"Metrc Transfer Package"}
      contentWidth={600}
      handleClose={handleClose}
    >
      {isBankUser && (
        <Tabs
          value={selectedTabIndex}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_: any, value: number) => setSelectedTabIndex(value)}
          style={{
            display: "flex",
            justifyContent: "center",
            marginLeft: "100px",
            marginRight: "100px",
          }}
        >
          <Tab
            data-cy={"general-information"}
            key={MetrcTransferDrawerTabLabel.GeneralInformation}
            label={MetrcTransferDrawerTabLabel.GeneralInformation}
            style={{ width: "200px" }}
          />
          <Tab
            data-cy={"only-for-bank"}
            key={MetrcTransferDrawerTabLabel.OnlyForBank}
            label={MetrcTransferDrawerTabLabel.OnlyForBank}
            style={{ width: "200px" }}
          />
        </Tabs>
      )}
      {selectedTabIndex === 0 ? (
        <MetrcPackageGeneralInformationDrawerTab metrcPackage={metrcPackage} />
      ) : (
        <MetrcPackageOnlyForBankDrawerTab metrcPackage={metrcPackage} />
      )}
    </Modal>
  );
};

export default MetrcPackageDrawer;

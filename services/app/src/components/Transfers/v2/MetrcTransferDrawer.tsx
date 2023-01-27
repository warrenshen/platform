import { Tab, Tabs } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import MetrcTransferGeneralInformationDrawerTab from "components/Transfers/v2/MetrcTransferGeneralInformationDrawerTab";
import MetrcTransferOnlyForBankDrawerTab from "components/Transfers/v2/MetrcTransferOnlyForBankDrawerTab";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { MetrcTransfers, useGetMetrcTransferQuery } from "generated/graphql";
import { MetrcTransferDrawerTabLabel } from "lib/enum";
import { useContext, useState } from "react";

interface Props {
  metrcTransferId: MetrcTransfers["id"];
  handleClose: () => void;
}

const MetrcTransferDrawer = ({ metrcTransferId, handleClose }: Props) => {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const { data, error } = useGetMetrcTransferQuery({
    fetchPolicy: "network-only",
    variables: {
      id: metrcTransferId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const metrcTransfer = data?.metrc_transfers_by_pk;

  if (!metrcTransfer) {
    return null;
  }

  return (
    <Modal
      title={"Metrc Transfer (Manifest)"}
      contentWidth={1000}
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
            marginLeft: "300px",
            marginRight: "300px",
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
        <MetrcTransferGeneralInformationDrawerTab
          metrcTransfer={metrcTransfer}
          isBankUser={isBankUser}
        />
      ) : (
        <MetrcTransferOnlyForBankDrawerTab metrcTransfer={metrcTransfer} />
      )}
    </Modal>
  );
};

export default MetrcTransferDrawer;

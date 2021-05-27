import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import MetrcPackagesDataGrid from "components/Transfers/MetrcPackagesDataGrid";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { MetrcTransfers, useGetMetrcTransferQuery } from "generated/graphql";
import { useContext } from "react";

interface Props {
  metrcTransferId: MetrcTransfers["id"];
  handleClose: () => void;
}

export default function MetrcTransferModal({
  metrcTransferId,
  handleClose,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data } = useGetMetrcTransferQuery({
    fetchPolicy: "network-only",
    variables: {
      id: metrcTransferId,
    },
  });

  const metrcTransfer = data?.metrc_transfers_by_pk;

  if (!metrcTransfer) {
    return null;
  }

  return (
    <Modal
      title={"Metrc Manifest / Transfer"}
      subtitle={metrcTransfer.manifest_number}
      contentWidth={1000}
      handleClose={handleClose}
    >
      <Box display="flex" flexDirection="column" mt={2}>
        <Box mb={1}>
          <Typography variant="body1">
            Manifests, Packages, & Lab Test Results
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Manifest #
          </Typography>
          <Typography variant="body1">
            {metrcTransfer.manifest_number}
          </Typography>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Packages
            </Typography>
            <MetrcPackagesDataGrid
              isExcelExport={isBankUser}
              metrcPackages={metrcTransfer.metrc_packages}
            />
          </Box>
        </Box>
      </Box>
      {isBankUser && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={2}
        >
          <Typography variant="subtitle2" color="textSecondary">
            Platform ID
          </Typography>
          <Typography variant={"body1"}>{metrcTransfer.id}</Typography>
        </Box>
      )}
    </Modal>
  );
}

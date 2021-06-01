import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import RawJsonToggle from "components/Shared/RawJsonToggle";
import MetrcPackagesDataGrid from "components/Transfers/MetrcPackagesDataGrid";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { MetrcTransfers, useGetMetrcTransferQuery } from "generated/graphql";
import { formatDatetimeString } from "lib/date";
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

  const metrcTransferPayload = metrcTransfer.transfer_payload;

  return (
    <Modal
      title={"Metrc Manifest / Transfer"}
      subtitle={metrcTransfer.manifest_number}
      contentWidth={1000}
      handleClose={handleClose}
    >
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Manifest #
        </Typography>
        <Typography variant="body1">{metrcTransfer.manifest_number}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Vendor
        </Typography>
        <Typography variant="body1">
          {metrcTransfer.vendor?.name || "Unknown"}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Estimated Departure Time
        </Typography>
        <Typography variant="body1">
          {formatDatetimeString(
            metrcTransferPayload.EstimatedDepartureDateTime
          )}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Estimated Arrival Time
        </Typography>
        <Typography variant="body1">
          {formatDatetimeString(metrcTransferPayload.EstimatedArrivalDateTime)}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Received Date Time
        </Typography>
        <Typography variant="body1">
          {formatDatetimeString(metrcTransferPayload.ReceivedDateTime)}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          {`Packages (${metrcTransfer.metrc_packages.length})`}
        </Typography>
        <MetrcPackagesDataGrid metrcPackages={metrcTransfer.metrc_packages} />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Raw Metrc JSON
        </Typography>
        <RawJsonToggle rawJson={metrcTransferPayload} />
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

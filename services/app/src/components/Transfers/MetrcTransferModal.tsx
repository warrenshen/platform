import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import RawJsonToggle from "components/Shared/RawJsonToggle";
import MetrcPackagesDataGrid from "components/Transfers/MetrcPackagesDataGrid";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  MetrcTransfers,
  useGetMetrcTransferQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { formatDatetimeString } from "lib/date";
import { useContext } from "react";

interface Props {
  companyId: Companies["id"];
  metrcTransferId: MetrcTransfers["id"];
  handleClose: () => void;
}

export default function MetrcTransferModal({
  companyId,
  metrcTransferId,
  handleClose,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data, error } = useGetMetrcTransferQuery({
    fetchPolicy: "network-only",
    variables: {
      id: metrcTransferId,
      company_id: companyId,
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

  const transferPayload = metrcTransfer.transfer_payload;

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
          Last Modified Date Time (in Metrc)
        </Typography>
        <Typography variant="body1">
          {formatDatetimeString(transferPayload.LastModified)}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Shipper Facility Name (License Number)
        </Typography>
        <Typography variant="body1">
          {`${transferPayload.ShipperFacilityName} (${transferPayload.ShipperFacilityLicenseNumber})`}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Recipient Facility Name (License Number)
        </Typography>
        <Typography variant="body1">
          {`${transferPayload.RecipientFacilityName} (${transferPayload.RecipientFacilityLicenseNumber})`}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Vendor
        </Typography>
        <Typography variant="body1">
          {!!metrcTransfer.vendor
            ? getCompanyDisplayName(metrcTransfer.vendor)
            : "Unknown"}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Estimated Departure Time
        </Typography>
        <Typography variant="body1">
          {formatDatetimeString(transferPayload.EstimatedDepartureDateTime)}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Estimated Arrival Time
        </Typography>
        <Typography variant="body1">
          {formatDatetimeString(transferPayload.EstimatedArrivalDateTime)}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Received Date Time
        </Typography>
        <Typography variant="body1">
          {formatDatetimeString(transferPayload.ReceivedDateTime)}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          {`Packages (${metrcTransfer.metrc_packages.length})`}
        </Typography>
        <MetrcPackagesDataGrid
          isViewActionAvailable={isBankUser}
          metrcPackages={metrcTransfer.metrc_packages}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Raw Transfer JSON
        </Typography>
        <RawJsonToggle rawJson={transferPayload} />
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

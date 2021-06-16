import { Box, Button, Typography } from "@material-ui/core";
import { ReactComponent as CloseIcon } from "components/Shared/Layout/Icons/Close.svg";
import ModalButton from "components/Shared/Modal/ModalButton";
import MetrcTransferModal from "components/Transfers/MetrcTransferModal";
import {
  Companies,
  MetrcTransfers,
  useGetMetrcTransferQuery,
} from "generated/graphql";
import { getMetrcTransferVendorDescription } from "lib/api/metrc";
import { formatDatetimeString } from "lib/date";
import styled from "styled-components";

const Manifest = styled.div`
  display: flex;

  padding: 12px 12px;
  border: 1px solid rgba(95, 90, 84, 0.1);
  border-radius: 3px;
`;

const CloseButton = styled(Button)`
  width: 36px;
  min-width: 36px;
  height: 36px;
`;

interface Props {
  companyId: Companies["id"];
  metrcTransferId: MetrcTransfers["id"];
  handleClickClose?: () => void;
}

export default function MetrcTransferInfoCard({
  companyId,
  metrcTransferId,
  handleClickClose,
}: Props) {
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

  const metrcTransferPayload = metrcTransfer.transfer_payload;

  return (
    <Manifest>
      <Box display="flex" flexDirection="column" flex={1}>
        <Typography variant="body1">
          {`Manifest #${metrcTransfer.manifest_number}`}
        </Typography>
        <Typography variant="body2">
          {`Vendor: ${getMetrcTransferVendorDescription(metrcTransfer)}`}
        </Typography>
        <Typography variant="body2">
          {`Received at: ${formatDatetimeString(
            metrcTransferPayload.ReceivedDateTime
          )}`}
        </Typography>
        <Typography variant="body2">
          {`Package(s) count: ${
            metrcTransferPayload.PackageCount != null
              ? metrcTransferPayload.PackageCount
              : "Unknown"
          }`}
        </Typography>
        <Typography variant="body2">
          {`Lab results: ${metrcTransfer.lab_results_status || "Unknown"}`}
        </Typography>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        {!!handleClickClose && (
          <CloseButton onClick={handleClickClose}>
            <CloseIcon />
          </CloseButton>
        )}
        <ModalButton
          label={"View"}
          color="default"
          size="small"
          variant="outlined"
          modal={({ handleClose }) => (
            <MetrcTransferModal
              companyId={companyId}
              metrcTransferId={metrcTransfer.id}
              handleClose={handleClose}
            />
          )}
        />
      </Box>
    </Manifest>
  );
}

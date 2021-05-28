import { Box, Button, Typography } from "@material-ui/core";
import { ReactComponent as CloseIcon } from "components/Shared/Layout/Icons/Close.svg";
import ModalButton from "components/Shared/Modal/ModalButton";
import MetrcTransferModal from "components/Transfers/MetrcTransferModal";
import { MetrcTransferFragment } from "generated/graphql";
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
  metrcTransfer: MetrcTransferFragment;
  handleClickClose?: () => void;
}

export default function MetrcTransferInfoCard({
  metrcTransfer,
  handleClickClose,
}: Props) {
  const metrcTransferPayload = metrcTransfer.transfer_payload;

  return (
    <Manifest>
      <Box display="flex" flexDirection="column" flex={1}>
        <Typography variant="body1">
          {`Manifest #${metrcTransfer.manifest_number}`}
        </Typography>
        <Typography variant="body2">
          {`Vendor: ${metrcTransfer.vendor?.name || "Unknown"}`}
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
              metrcTransferId={metrcTransfer.id}
              handleClose={handleClose}
            />
          )}
        />
      </Box>
    </Manifest>
  );
}
import { Box, Typography } from "@material-ui/core";
import { MetrcTransferFragment } from "generated/graphql";
import { formatDatetimeString } from "lib/date";
import styled from "styled-components";

const Manifest = styled.div`
  display: flex;

  padding: 12px 12px;
  border: 1px solid rgba(95, 90, 84, 0.1);
  border-radius: 3px;
`;

interface Props {
  metrcTransfer: MetrcTransferFragment;
  handleClickClose?: () => void;
}

export default function MetrcTransferInfoCardForVendor({
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
          {`Estimated Departure Date: ${formatDatetimeString(
            metrcTransferPayload.EstimatedDepartureDateTime,
            false
          )}`}
        </Typography>
        <Typography variant="body2">
          {`Estimated Arrival Date: ${formatDatetimeString(
            metrcTransferPayload.EstimatedArrivalDateTime,
            false
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
    </Manifest>
  );
}

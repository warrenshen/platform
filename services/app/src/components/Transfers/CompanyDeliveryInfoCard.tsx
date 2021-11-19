import { Box, Button, Typography } from "@material-ui/core";
import { ReactComponent as CloseIcon } from "components/Shared/Layout/Icons/Close.svg";
import ModalButton from "components/Shared/Modal/ModalButton";
import MetrcTransferModal from "components/Transfers/MetrcTransferModal";
import {
  Companies,
  CompanyDeliveries,
  useGetCompanyDeliveryQuery,
} from "generated/graphql";
import { getCompanyDeliveryVendorDescription } from "lib/api/metrc";
import { formatDateString, formatDatetimeString } from "lib/date";
import styled from "styled-components";

const Manifest = styled.div`
  display: flex;

  padding: 12px 12px;
  border: 1px solid rgba(95, 90, 84, 0.1);
  border-radius: 3px;
`;

const CloseButton = styled(Button)`
  width: 36px;
  min-width: 36px !important;
  height: 36px;
`;

interface Props {
  companyDeliveryId: CompanyDeliveries["id"];
  companyId: Companies["id"];
  handleClickClose?: () => void;
}

export default function CompanyDeliveryInfoCard({
  companyDeliveryId,
  companyId,
  handleClickClose,
}: Props) {
  const { data, error } = useGetCompanyDeliveryQuery({
    fetchPolicy: "network-only",
    variables: {
      id: companyDeliveryId,
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const companyDelivery = data?.company_deliveries_by_pk;

  if (!companyDelivery) {
    return null;
  }

  const metrcTransfer = companyDelivery.metrc_transfer;
  const metrcDelivery = companyDelivery.metrc_delivery;
  const metrcTransferPayload = metrcTransfer.transfer_payload;
  return (
    <Manifest>
      <Box display="flex" flexDirection="column" flex={1}>
        <Typography variant="body1">
          {`Manifest #${metrcTransfer.manifest_number}`}
        </Typography>
        <Typography variant="body2">
          {`License from -> to: ${metrcTransfer.shipper_facility_license_number} -> ${metrcDelivery.recipient_facility_license_number}`}
        </Typography>
        <Typography variant="body2">
          {`Vendor: ${getCompanyDeliveryVendorDescription(companyDelivery)}`}
        </Typography>
        <Typography variant="body2">
          {`Received at: ${formatDatetimeString(
            metrcDelivery.received_datetime
          )}`}
        </Typography>
        <Typography variant="body2">
          {`Created date: ${formatDateString(metrcTransfer.created_date)}`}
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
              metrcTransferId={metrcTransfer.id}
              handleClose={handleClose}
            />
          )}
        />
      </Box>
    </Manifest>
  );
}

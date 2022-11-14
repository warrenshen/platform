import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import ModalDataPoint from "components/Shared/Modal/ModalDataPoint";
import RawJsonToggle from "components/Shared/RawJsonToggle";
import { MetrcApiKeys, useGetMetrcApiKeyQuery } from "generated/graphql";

interface Props {
  metrcApiKeyId: MetrcApiKeys["id"];
  handleClose: () => void;
}

export default function MetrcApiKeyModal({
  metrcApiKeyId,
  handleClose,
}: Props) {
  const { data } = useGetMetrcApiKeyQuery({
    fetchPolicy: "network-only",
    variables: {
      id: metrcApiKeyId,
    },
  });

  const metrcApiKey = data?.metrc_api_keys_by_pk;

  if (!metrcApiKey) {
    return null;
  }

  return (
    <Modal
      title={"Metrc API Key"}
      subtitle={metrcApiKey.id}
      contentWidth={1000}
      handleClose={handleClose}
    >
      <ModalDataPoint subtitle={"ID"} text={metrcApiKey.id} />
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Status Codes Payload JSON
        </Typography>
        <RawJsonToggle rawJson={metrcApiKey.status_codes_payload} />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Facilities Payload JSON
        </Typography>
        <RawJsonToggle rawJson={metrcApiKey.facilities_payload} />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Permissions Payload JSON
        </Typography>
        <RawJsonToggle rawJson={metrcApiKey.permissions_payload} />
      </Box>
    </Modal>
  );
}

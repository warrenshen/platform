import { Box } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AddMetrcKeyModal from "components/Settings/Bank/AddMetrcKeyModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CompanySettings, MetrcApiKeyFragment } from "generated/graphql";

interface Props {
  companySettingsId: CompanySettings["id"];
  metrcApiKey: MetrcApiKeyFragment;
}

export default function MetrcApiKeys(props: Props) {
  if (props.metrcApiKey) {
    return (
      <Box>
        <Box>Metrc API key is setup</Box>
      </Box>
    );
  } else {
    return (
      <Box>
        <Box mb={1}>
          <Alert severity="warning">No Metrc API key setup yet</Alert>
        </Box>
        <Box>
          <ModalButton
            label={"Add API Key"}
            modal={({ handleClose }) => (
              <AddMetrcKeyModal
                companySettingsId={props.companySettingsId}
                handleClose={() => {
                  handleClose();
                }}
              />
            )}
          ></ModalButton>
        </Box>
      </Box>
    );
  }
}

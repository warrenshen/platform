import { Box, Button } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AddMetrcKeyModal from "components/Settings/Bank/AddMetrcKeyModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CompanySettings, MetrcApiKeyFragment } from "generated/graphql";
import { viewApiKey } from "lib/api/metrc";
import { useState } from "react";
interface Props {
  companySettingsId: CompanySettings["id"];
  metrcApiKey: MetrcApiKeyFragment;
}

export default function MetrcApiKeys(props: Props) {
  const [apiKeyValue, setApiKeyValue] = useState<string>("");

  if (props.metrcApiKey) {
    return (
      <Box>
        <Box>Metrc API key is setup</Box>
        <Button
          color="default"
          size="small"
          variant="outlined"
          onClick={async () => {
            const resp = await viewApiKey({
              variables: {
                metrc_api_key_id: props.metrcApiKey.id,
              },
            });
            if (resp.status === "OK") {
              setApiKeyValue(resp.api_key);
            }
          }}
        >
          View Key
        </Button>
        {apiKeyValue.length > 0 && <Box>{apiKeyValue}</Box>}
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

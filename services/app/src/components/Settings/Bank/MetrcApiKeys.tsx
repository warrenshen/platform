import { Box } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import UpsertMetrcKeyModal from "components/Settings/Bank/UpsertMetrcKeyModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CompanySettings, MetrcApiKeyFragment } from "generated/graphql";
import { useState } from "react";

interface Props {
  companySettingsId: CompanySettings["id"];
  metrcApiKey: MetrcApiKeyFragment;
  handleDataChange: () => void;
}

export default function MetrcApiKeys({
  companySettingsId,
  metrcApiKey,
  handleDataChange,
}: Props) {
  const [apiKeyValue, setApiKeyValue] = useState<string>("");

  const hasKey = !!metrcApiKey;

  return (
    <Box>
      {!hasKey && (
        <Box mb={1}>
          <Alert severity="warning">No Metrc API key setup yet</Alert>
        </Box>
      )}
      <Box>
        <ModalButton
          label={hasKey ? "Edit API Key" : "Add API Key"}
          modal={({ handleClose }) => (
            <UpsertMetrcKeyModal
              metrcApiKey={metrcApiKey}
              companySettingsId={companySettingsId}
              handleClose={() => {
                handleDataChange();
                handleClose();
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
}

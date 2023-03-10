import { Box, Checkbox, FormControlLabel } from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { ParentCompanies } from "generated/graphql";
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
import { Action } from "lib/auth/rbac-rules";
import { CustomerEmailsEnum } from "lib/enum";
import { useState } from "react";

import ChangeParentCompanyEmailSettingsModal from "./ChangeParentCompanyEmailSettingsModal";

interface Props {
  parentCompanyId: ParentCompanies["id"];
  emailTypesEnabled: CustomerEmailsEnum[];
  refetch: () => void;
}

export default function ManageParentCompanyEmailSettings({
  parentCompanyId,
  emailTypesEnabled,
  refetch,
}: Props) {
  const [
    isChangeParentCompanyEmailSettingsModalOpen,
    setIsChangeParentCompanyEmailSettingsModalOpen,
  ] = useState(false);

  const financialStatementAlerts = emailTypesEnabled.includes(
    CustomerEmailsEnum.FinancialStatementAlerts
  );

  return (
    <Box mt={4}>
      <Box>
        {isChangeParentCompanyEmailSettingsModalOpen && (
          <ChangeParentCompanyEmailSettingsModal
            parentCompanyId={parentCompanyId}
            emailTypesEnabled={emailTypesEnabled || []}
            handleClose={() => {
              setIsChangeParentCompanyEmailSettingsModalOpen(false);
              refetch();
            }}
          />
        )}
      </Box>
      <Box display={"flex"}>
        <Text textVariant={TextVariants.ParagraphLead}>Email Alerts</Text>
      </Box>
      <Box display={"flex"} flexDirection={"row-reverse"} mt={-6}>
        <Can perform={Action.ManipulateUser}>
          <PrimaryButton
            dataCy={"change-email-alert-button"}
            text={"Change email alert status"}
            onClick={() => setIsChangeParentCompanyEmailSettingsModalOpen(true)}
          />
        </Can>
      </Box>
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              disabled={true}
              checked={financialStatementAlerts}
              color="primary"
              icon={<CustomCheckboxUnchecked />}
              checkedIcon={<CustomCheckboxChecked />}
            />
          }
          label={
            financialStatementAlerts
              ? "Financial statement alerts are being sent out"
              : "Financial statement alerts are NOT being sent out"
          }
        />
      </Box>
      <Box mt={6}>
        <Text textVariant={TextVariants.Label}>
          Enabling email alerts for parent company subscribes ALL child
          companies to alerts.
        </Text>
      </Box>
    </Box>
  );
}

import {
  Box,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { ParentCompanies } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
import { updateParentCompanyEmailAlertSettingsMutation } from "lib/api/settings";
import { CustomerEmailsEnum } from "lib/enum";
import { useState } from "react";
import styled from "styled-components";

const StyledButtonContainer = styled.div`
  display: flex;
  margin: 32px;
  padding: 0px;
`;

interface Props {
  parentCompanyId: ParentCompanies["id"];
  emailTypesEnabled: CustomerEmailsEnum[];
  handleClose: () => void;
}

export default function ChangeParentCompanyEmailSettingsModal({
  parentCompanyId,
  emailTypesEnabled,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [updatedEmailTypesEnabled, setUpdatedEmailTypesEnabled] = useState(
    new Set(emailTypesEnabled || [])
  );

  const [updateEmailAlerts, { loading: isUpdateEmailAlertsLoading }] =
    useCustomMutation(updateParentCompanyEmailAlertSettingsMutation);

  const handleClickSubmit = async () => {
    const response = await updateEmailAlerts({
      variables: {
        parent_company_id: parentCompanyId,
        email_alerts: Array.from(updatedEmailTypesEnabled),
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Updated email status.");
      handleClose();
    }
  };
  return (
    <ModalDialog
      title="Set Email Alerts"
      width="500px"
      maxWidth="md"
      handleClose={() => {
        handleClose();
      }}
    >
      <DialogContent>
        <Text textVariant={TextVariants.ParagraphLead}>
          Enabling email alerts for parent company subscribes ALL child
          companies to alerts.
        </Text>
        <Box mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={updatedEmailTypesEnabled.has(
                  CustomerEmailsEnum.FinancialStatementAlerts
                )}
                onChange={(event) => {
                  if (event.target.checked) {
                    updatedEmailTypesEnabled.add(
                      CustomerEmailsEnum.FinancialStatementAlerts
                    );
                    setUpdatedEmailTypesEnabled(
                      new Set(updatedEmailTypesEnabled)
                    );
                  } else {
                    updatedEmailTypesEnabled.delete(
                      CustomerEmailsEnum.FinancialStatementAlerts
                    );
                    setUpdatedEmailTypesEnabled(
                      new Set(updatedEmailTypesEnabled)
                    );
                  }
                }}
                color="primary"
                icon={<CustomCheckboxUnchecked />}
                checkedIcon={<CustomCheckboxChecked />}
              />
            }
            label={"Financial Alert Statements Sent?"}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <StyledButtonContainer>
          <SecondaryButton text={"Cancel"} onClick={handleClose} />
          <PrimaryButton
            isDisabled={isUpdateEmailAlertsLoading}
            text={"Confirm"}
            onClick={() => {
              handleClickSubmit();
            }}
          />
        </StyledButtonContainer>
      </DialogActions>
    </ModalDialog>
  );
}

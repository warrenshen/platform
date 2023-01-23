import {
  Box,
  DialogActions,
  DialogContent,
  TextField,
} from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { ParentCompaniesInsertInput } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { editParentCompany } from "lib/api/companies";
import { useState } from "react";

interface Props {
  companyName: string;
  companyId: string;
  handleClose: () => void;
}

export default function EditParentCompanyModal({
  companyName,
  companyId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [company, setCompany] = useState<ParentCompaniesInsertInput>({
    id: companyId,
    name: companyName,
  });

  const handleClickCreate = async () => {
    const response = await editParentCompany({
      company: company,
    });
    if (response.status !== "OK") {
      snackbar.showError(`Could not edit company! Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Company edited.");
      handleClose();
    }
  };

  const isSubmitDisabled = !company.name;

  return (
    <ModalDialog
      width="500px"
      handleClose={handleClose}
      title={"Edit Parent Company Details"}
    >
      <DialogContent>
        <Text textVariant={TextVariants.Paragraph}>
          Please provide details about company.
        </Text>
        <Box mb={8}>
          <TextField
            fullWidth
            data-cy={"company-form-input-name"}
            autoFocus
            label="Company Name"
            value={company.name}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, name: value })
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex" mt={-3} mb={3} mr={3}>
          <Box mr={1}>
            <SecondaryButton text={"Cancel"} onClick={handleClose} />
          </Box>
          <PrimaryButton
            dataCy="edit-parent-company-modal-submit"
            isDisabled={isSubmitDisabled}
            text={"Submit"}
            onClick={handleClickCreate}
          />
        </Box>
      </DialogActions>
    </ModalDialog>
  );
}

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
import {
  ParentCompanies,
  useGetParentCompanyWithChildCompaniesQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
import { updateParentAccountDummyStatusMutation } from "lib/api/settings";
import { useMemo, useState } from "react";
import styled from "styled-components";

const StyledButtonContainer = styled.div`
  display: flex;
  margin: 32px;
  padding: 0px;
`;

interface Props {
  parentCompanyId: ParentCompanies["id"];
  handleClose: () => void;
}

export default function ChangeParentCompanyDummyAccountStatusModal({
  parentCompanyId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const { data, refetch } = useGetParentCompanyWithChildCompaniesQuery({
    variables: {
      parent_company_id: parentCompanyId,
    },
  });

  const [isDummyAccount, setIsDummyAccount] = useState(false);

  useMemo(
    () =>
      setIsDummyAccount(
        data?.parent_companies_by_pk?.child_companies?.[0]?.settings
          ?.is_dummy_account || false
      ),
    [data?.parent_companies_by_pk?.child_companies]
  );

  const [updateIsDummyAccount, { loading: isUpdateDummyAccountLoading }] =
    useCustomMutation(updateParentAccountDummyStatusMutation);

  const handleClickSubmit = async () => {
    const response = await updateIsDummyAccount({
      variables: {
        parent_company_id: parentCompanyId,
        is_dummy_account: isDummyAccount,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Updated dummy account status.");
      handleClose();
    }
  };
  return (
    <ModalDialog
      title="Set Dummy Parent Company"
      width="500px"
      maxWidth="md"
      handleClose={() => {
        handleClose();
        refetch();
      }}
    >
      <DialogContent>
        <Text textVariant={TextVariants.ParagraphLead}>
          Enabling "Is Dummy Parent Company" excludes this Parent Company and
          all companies inside from all financial calculations.
        </Text>
        <Box mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isDummyAccount}
                onChange={(event) => {
                  setIsDummyAccount(event.target.checked);
                }}
                color="primary"
                icon={<CustomCheckboxUnchecked />}
                checkedIcon={<CustomCheckboxChecked />}
              />
            }
            label={"Is Dummy Account?"}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <StyledButtonContainer>
          <SecondaryButton text={"Cancel"} onClick={handleClose} />
          <PrimaryButton
            isDisabled={isUpdateDummyAccountLoading}
            text={"Confirm"}
            onClick={() => {
              handleClickSubmit();
              refetch();
            }}
          />
        </StyledButtonContainer>
      </DialogActions>
    </ModalDialog>
  );
}

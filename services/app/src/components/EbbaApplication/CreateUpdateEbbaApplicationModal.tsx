import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import EbbaApplicationForm from "components/EbbaApplication/EbbaApplicationForm";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  EbbaApplicationFilesInsertInput,
  EbbaApplications,
  EbbaApplicationsInsertInput,
  useAddEbbaApplicationMutation,
  useGetCompanyWithActiveContractQuery,
  useGetEbbaApplicationQuery,
  useUpdateEbbaApplicationMutation,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { submitEbbaApplicationMutation } from "lib/api/ebbaApplications";
import { computeEbbaApplicationExpiresAt } from "lib/date";
import { ActionType, ClientSurveillanceCategoryEnum } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useContext, useMemo, useState } from "react";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  ebbaApplicationId: EbbaApplications["id"] | null;
  handleClose: () => void;
}

export default function CreateUpdateEbbaApplicationModal({
  actionType,
  companyId,
  ebbaApplicationId = null,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const isActionTypeUpdate = actionType === ActionType.Update;

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data } = useGetCompanyWithActiveContractQuery({
    variables: {
      companyId,
    },
  });

  const company = data?.companies_by_pk;

  const existingContractFields = useMemo(
    () => (company?.contract ? company.contract.product_config.v1.fields : []),
    [company]
  );

  const accountsReceivablePercentage = useMemo(
    () =>
      existingContractFields.find(
        (field: any) =>
          field.internal_name ===
          "borrowing_base_accounts_receivable_percentage"
      )?.value || 0,
    [existingContractFields]
  );
  const inventoryPercentage = useMemo(
    () =>
      existingContractFields.find(
        (field: any) =>
          field.internal_name === "borrowing_base_inventory_percentage"
      )?.value || 0,
    [existingContractFields]
  );
  const cashPercentage = useMemo(
    () =>
      existingContractFields.find(
        (field: any) => field.internal_name === "borrowing_base_cash_percentage"
      )?.value || 0,
    [existingContractFields]
  );
  const cashInDacaPercentage = useMemo(
    () =>
      existingContractFields.find(
        (field: any) =>
          field.internal_name === "borrowing_base_cash_in_daca_percentage"
      )?.value || 0,
    [existingContractFields]
  );

  const isAccountsReceivableVisible = accountsReceivablePercentage > 0;
  const isInventoryVisible = inventoryPercentage > 0;
  const isCashVisible = cashPercentage > 0;
  const isCashInDacaVisible = cashInDacaPercentage > 0;

  // Default EbbaApplication for CREATE case.
  const newEbbaApplication = {
    application_date: null,
    monthly_accounts_receivable: null,
    monthly_inventory: null,
    monthly_cash: null,
    amount_cash_in_daca: null,
    calculated_borrowing_base: null,
  } as EbbaApplicationsInsertInput;

  const [ebbaApplication, setEbbaApplication] = useState(newEbbaApplication);

  const [ebbaApplicationFiles, setEbbaApplicationFiles] = useState<
    EbbaApplicationFilesInsertInput[]
  >([]);

  const {
    loading: isExistingEbbaApplicationLoading,
  } = useGetEbbaApplicationQuery({
    skip: actionType === ActionType.New,
    fetchPolicy: "network-only",
    variables: {
      id: ebbaApplicationId,
    },
    onCompleted: (data) => {
      const existingEbbaApplication = data?.ebba_applications_by_pk;
      if (existingEbbaApplication) {
        setEbbaApplication(
          mergeWith(newEbbaApplication, existingEbbaApplication, (a, b) =>
            isNull(b) ? a : b
          )
        );
        setEbbaApplicationFiles(
          existingEbbaApplication.ebba_application_files.map(
            (ebbaApplicationFile) => ({
              ebba_application_id: ebbaApplicationFile.ebba_application_id,
              file_id: ebbaApplicationFile.file_id,
            })
          )
        );
      } else {
        snackbar.showError("Error! Could not get expected borrowing base.");
      }
    },
  });

  const [
    addEbbaApplication,
    { loading: isAddEbbaApplicationLoading },
  ] = useAddEbbaApplicationMutation();

  const [
    updateEbbaApplication,
    { loading: isUpdateEbbaApplicationLoading },
  ] = useUpdateEbbaApplicationMutation();

  const [
    submitEbbaApplication,
    { loading: isSubmitEbbaApplicationLoading },
  ] = useCustomMutation(submitEbbaApplicationMutation);

  const calculatedBorrowingBase =
    ebbaApplication.monthly_accounts_receivable * accountsReceivablePercentage +
    ebbaApplication.monthly_inventory * inventoryPercentage +
    ebbaApplication.monthly_cash * cashPercentage +
    ebbaApplication.amount_cash_in_daca * cashInDacaPercentage;

  const computedExpiresAt = computeEbbaApplicationExpiresAt(
    ebbaApplication.application_date
  );

  const upsertEbbaApplication = async () => {
    if (isActionTypeUpdate) {
      const response = await updateEbbaApplication({
        variables: {
          id: ebbaApplication.id,
          ebbaApplication: {
            application_date: ebbaApplication.application_date,
            monthly_accounts_receivable:
              ebbaApplication.monthly_accounts_receivable,
            monthly_inventory: ebbaApplication.monthly_inventory,
            monthly_cash: ebbaApplication.monthly_cash,
            amount_cash_in_daca: ebbaApplication.amount_cash_in_daca,
            calculated_borrowing_base: calculatedBorrowingBase,
            expires_at: computedExpiresAt,
          },
          ebbaApplicationFiles,
        },
      });
      return response.data?.update_ebba_applications_by_pk;
    } else {
      const response = await addEbbaApplication({
        variables: {
          ebbaApplication: {
            company_id: isBankUser ? companyId : undefined,
            category: ClientSurveillanceCategoryEnum.BorrowingBase,
            application_date: ebbaApplication.application_date,
            monthly_accounts_receivable:
              ebbaApplication.monthly_accounts_receivable,
            monthly_inventory: ebbaApplication.monthly_inventory,
            monthly_cash: ebbaApplication.monthly_cash,
            amount_cash_in_daca: ebbaApplication.amount_cash_in_daca,
            calculated_borrowing_base: calculatedBorrowingBase,
            expires_at: computedExpiresAt,
            ebba_application_files: {
              data: ebbaApplicationFiles,
            },
          },
        },
      });
      return response.data?.insert_ebba_applications_one;
    }
  };

  const handleClickSubmit = async () => {
    const savedEbbaApplication = await upsertEbbaApplication();
    if (!savedEbbaApplication) {
      snackbar.showError(
        "Error! Could not upsert borrowing base certification."
      );
      return;
    }

    // If editing the ebba application (only done by bank user),
    // there is no need to submit it to the bank.
    if (isActionTypeUpdate) {
      snackbar.showSuccess("Borrowing base certification saved.");
      handleClose();
    } else {
      const response = await submitEbbaApplication({
        variables: {
          ebba_application_id: savedEbbaApplication.id,
        },
      });
      if (response.status === "ERROR") {
        snackbar.showError(`Message: ${response.msg}`);
      } else {
        snackbar.showSuccess(
          "Borrowing base certification saved and submitted to Bespoke."
        );
        handleClose();
      }
    }
  };

  const isDialogReady = !isExistingEbbaApplicationLoading;
  const isFormLoading =
    isAddEbbaApplicationLoading ||
    isUpdateEbbaApplicationLoading ||
    isSubmitEbbaApplicationLoading;
  const isSubmitDisabled =
    isFormLoading ||
    (isAccountsReceivableVisible &&
      ebbaApplication.monthly_accounts_receivable === null) ||
    (isInventoryVisible && ebbaApplication.monthly_inventory === null) ||
    (isCashVisible && ebbaApplication.monthly_cash === null) ||
    (isCashInDacaVisible && ebbaApplication.amount_cash_in_daca === null) ||
    ebbaApplicationFiles.length <= 0;

  if (!isDialogReady) {
    return null;
  }

  return (
    <Modal
      dataCy={"create-purchase-order-modal"}
      isPrimaryActionDisabled={isSubmitDisabled}
      title={`${
        isActionTypeUpdate ? "Edit" : "Create"
      } Borrowing Base Certification`}
      contentWidth={700}
      primaryActionText={"Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      {isBankUser && (
        <Box mt={2} mb={6}>
          <Alert severity="warning">
            <Typography variant="body1">
              {`Warning: you are ${
                isActionTypeUpdate ? "editing" : "creating"
              } a borrowing base certification on behalf of this
                customer (only bank admins can do this).`}
            </Typography>
          </Alert>
        </Box>
      )}
      <EbbaApplicationForm
        isAccountsReceivableVisible={isAccountsReceivableVisible}
        isInventoryVisible={isInventoryVisible}
        isCashVisible={isCashVisible}
        isCashInDacaVisible={isCashInDacaVisible}
        companyId={companyId}
        calculatedBorrowingBase={calculatedBorrowingBase}
        ebbaApplication={ebbaApplication}
        ebbaApplicationFiles={ebbaApplicationFiles}
        setEbbaApplication={setEbbaApplication}
        setEbbaApplicationFiles={setEbbaApplicationFiles}
      />
    </Modal>
  );
}

import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import EbbaApplicationBorrowingBaseForm from "components/EbbaApplication/EbbaApplicationBorrowingBaseForm";
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
  Files,
  useGetCompanyWithActiveContractQuery,
  useGetEbbaApplicationQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  addBorrowingBaseMutation,
  updateBorrowingBaseMutation,
} from "lib/api/ebbaApplications";
import { calculateBorrowingBaseAmount } from "lib/borrowingBase";
import { computeEbbaApplicationExpiresAt } from "lib/date";
import { ActionType, CustomerSurveillanceCategoryEnum } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useContext, useMemo, useState } from "react";
interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  ebbaApplicationId: EbbaApplications["id"] | null;
  handleClose: () => void;
}

export default function CreateUpdateBorrowingBaseCertificationModal({
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

  const isCustomAmountVisible = isBankUser; // Only bank users can edit custom amount / note.

  // Default EbbaApplication for CREATE case.
  const newEbbaApplication = {
    application_date: null,
    monthly_accounts_receivable: null,
    monthly_inventory: null,
    monthly_cash: null,
    amount_cash_in_daca: null,
    amount_custom: null,
    amount_custom_note: "",
    calculated_borrowing_base: null,
    company_id: companyId,
  } as EbbaApplicationsInsertInput;

  const [ebbaApplication, setEbbaApplication] = useState(newEbbaApplication);
  const [frozenFileIds, setFrozenFileIds] = useState<Files["id"][]>([]);
  const [ebbaApplicationFiles, setEbbaApplicationFiles] = useState<
    EbbaApplicationFilesInsertInput[]
  >([]);

  const { loading: isExistingEbbaApplicationLoading } =
    useGetEbbaApplicationQuery({
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
          setFrozenFileIds(
            existingEbbaApplication.ebba_application_files.map(
              (ebbaApplicationFile) => ebbaApplicationFile.file_id
            )
          );
        } else {
          snackbar.showError("Error! Could not get expected borrowing base.");
        }
      },
    });

  const [addBorrowingBase, { loading: isAddBorrowingBaseLoading }] =
    useCustomMutation(addBorrowingBaseMutation);

  const [updateBorrowingBase, { loading: isUpdateBorrowingBaseLoading }] =
    useCustomMutation(updateBorrowingBaseMutation);

  /**
   * Calculated borrowing base is the sum of the individual components,
   * with each individual component weighted by a corresponding percentage
   * from the customer's active contract.
   *
   * Bank admins may add an adjustment value which is not weighted.
   */

  const {
    calculatedBorrowingBase,
    isAccountsReceivableVisible,
    isInventoryVisible,
    isCashVisible,
    isCashInDacaVisible,
  } = useMemo(
    () => calculateBorrowingBaseAmount(ebbaApplication, existingContractFields),
    [ebbaApplication, existingContractFields]
  );

  const computedExpiresAt = computeEbbaApplicationExpiresAt(
    ebbaApplication.application_date
  );

  const handleClickSubmit = async () => {
    const response = !!isActionTypeUpdate
      ? await updateBorrowingBase({
          variables: {
            ebba_application_id: ebbaApplication.id,
            company_id: companyId,
            application_date: ebbaApplication.application_date,
            monthly_accounts_receivable:
              ebbaApplication.monthly_accounts_receivable,
            monthly_inventory: ebbaApplication.monthly_inventory,
            monthly_cash: ebbaApplication.monthly_cash,
            amount_cash_in_daca: ebbaApplication.amount_cash_in_daca,
            amount_custom: isCustomAmountVisible
              ? ebbaApplication.amount_custom
              : undefined,
            amount_custom_note: isCustomAmountVisible
              ? ebbaApplication.amount_custom_note
              : undefined,
            calculated_borrowing_base: calculatedBorrowingBase,
            expires_at: computedExpiresAt,
            ebba_application_files: ebbaApplicationFiles,
          },
        })
      : await addBorrowingBase({
          variables: {
            company_id: companyId,
            category: CustomerSurveillanceCategoryEnum.BorrowingBase,
            application_date: ebbaApplication.application_date,
            monthly_accounts_receivable:
              ebbaApplication.monthly_accounts_receivable,
            monthly_inventory: ebbaApplication.monthly_inventory,
            monthly_cash: ebbaApplication.monthly_cash,
            amount_cash_in_daca: ebbaApplication.amount_cash_in_daca,
            amount_custom: isCustomAmountVisible
              ? ebbaApplication.amount_custom
              : undefined,
            amount_custom_note: isCustomAmountVisible
              ? ebbaApplication.amount_custom_note
              : undefined,
            calculated_borrowing_base: calculatedBorrowingBase,
            expires_at: computedExpiresAt,
            ebba_application_files: ebbaApplicationFiles,
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
  };

  const isDialogReady = !isExistingEbbaApplicationLoading;
  const isFormLoading =
    isAddBorrowingBaseLoading || isUpdateBorrowingBaseLoading;
  const isSubmitDisabled =
    isFormLoading ||
    !ebbaApplication.application_date ||
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
      <EbbaApplicationBorrowingBaseForm
        isActionTypeUpdate={isActionTypeUpdate}
        isAccountsReceivableVisible={isAccountsReceivableVisible}
        isInventoryVisible={isInventoryVisible}
        isCashVisible={isCashVisible}
        isCashInDacaVisible={isCashInDacaVisible}
        isCustomAmountVisible={isCustomAmountVisible}
        companyId={companyId}
        frozenFileIds={frozenFileIds}
        calculatedBorrowingBase={calculatedBorrowingBase}
        ebbaApplication={ebbaApplication}
        ebbaApplicationFiles={ebbaApplicationFiles}
        setEbbaApplication={setEbbaApplication}
        setEbbaApplicationFiles={setEbbaApplicationFiles}
      />
    </Modal>
  );
}

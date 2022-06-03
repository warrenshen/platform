import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import EbbaApplicationFinancialReportsForm from "components/EbbaApplication/EbbaApplicationFinancialReportsForm";
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
  useGetEbbaApplicationQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  addFinancialReportMutation,
  updateFinancialReportMutation,
} from "lib/api/ebbaApplications";
import { computeEbbaApplicationExpiresAt } from "lib/date";
import { ActionType, ProductTypeEnum } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  ebbaApplicationId: EbbaApplications["id"] | null;
  handleClose: () => void;
  productType: ProductTypeEnum;
}

export default function CreateUpdateFinancialReportCertificationModal({
  actionType,
  companyId,
  ebbaApplicationId = null,
  handleClose,
  productType,
}: Props) {
  const snackbar = useSnackbar();

  const isActionTypeUpdate = actionType === ActionType.Update;

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  // Default EbbaApplication for CREATE case.
  const newEbbaApplication = {
    application_date: null,
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
          snackbar.showError(
            "Error! Could not get expected financial report certification."
          );
        }
      },
    });

  const [addFinancialReport, { loading: isAddFinancialReportLoading }] =
    useCustomMutation(addFinancialReportMutation);

  const [updateFinancialReport, { loading: isUpdateFinancialReportLoading }] =
    useCustomMutation(updateFinancialReportMutation);

  const computedExpiresAt = computeEbbaApplicationExpiresAt(
    ebbaApplication.application_date
  );

  const handleClickSubmit = async () => {
    const response = !!isActionTypeUpdate
      ? await updateFinancialReport({
          variables: {
            company_id: companyId,
            ebba_application_id: ebbaApplication.id,
            application_date: ebbaApplication.application_date,
            expires_at: computedExpiresAt,
            ebba_application_files: ebbaApplicationFiles,
          },
        })
      : await addFinancialReport({
          variables: {
            company_id: companyId,
            application_date: ebbaApplication.application_date,
            expires_at: computedExpiresAt,
            ebba_application_files: ebbaApplicationFiles,
          },
        });
    if (response.status === "ERROR") {
      snackbar.showError(`Message: ${response.msg}`);
    } else {
      snackbar.showSuccess(
        "Financial report certification saved and submitted to Bespoke."
      );
      handleClose();
    }
  };

  const isDialogReady = !isExistingEbbaApplicationLoading;
  const isFormLoading =
    isAddFinancialReportLoading || isUpdateFinancialReportLoading;
  const isSubmitDisabled = isFormLoading || ebbaApplicationFiles.length <= 0;

  if (!isDialogReady) {
    return null;
  }

  return (
    <Modal
      dataCy={"create-purchase-order-modal"}
      isPrimaryActionDisabled={isSubmitDisabled}
      title={`${
        isActionTypeUpdate ? "Edit" : "Create"
      } Financial Report Certification`}
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
              } a financial report certification on behalf of this
                customer (only bank admins can do this).`}
            </Typography>
          </Alert>
        </Box>
      )}
      <EbbaApplicationFinancialReportsForm
        isActionTypeUpdate={isActionTypeUpdate}
        isBankUser={isBankUser}
        companyId={companyId}
        frozenFileIds={frozenFileIds}
        ebbaApplication={ebbaApplication}
        ebbaApplicationFiles={ebbaApplicationFiles}
        setEbbaApplication={setEbbaApplication}
        setEbbaApplicationFiles={setEbbaApplicationFiles}
        productType={productType}
      />
      <Box mt={4}>
        <Alert severity="warning">
          <Typography>
            If you have PRIOR month financials that were ADJUSTED after being
            provided to Bespoke Financial, please edit your certification for
            that month and attach the updated documents.
          </Typography>
        </Alert>
      </Box>
    </Modal>
  );
}

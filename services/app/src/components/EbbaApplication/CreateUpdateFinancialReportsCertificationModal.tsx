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
  useAddEbbaApplicationMutation,
  useGetEbbaApplicationQuery,
  useUpdateEbbaApplicationMutation,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { submitEbbaApplicationMutation } from "lib/api/ebbaApplications";
import { computeEbbaApplicationExpiresAt } from "lib/date";
import {
  ActionType,
  ClientSurveillanceCategoryEnum,
  ProductTypeEnum,
} from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  ebbaApplicationId: EbbaApplications["id"] | null;
  handleClose: () => void;
  productType: ProductTypeEnum;
}

export default function CreateUpdateFinancialReportsCertificationModal({
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
        setFrozenFileIds(
          existingEbbaApplication.ebba_application_files.map(
            (ebbaApplicationFile) => ebbaApplicationFile.file_id
          )
        );
      } else {
        snackbar.showError("Error! Could not get expected financial reports.");
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
            category: ClientSurveillanceCategoryEnum.FinancialReports,
            application_date: ebbaApplication.application_date,
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
      snackbar.showError("Could not submit financial reports certification.");
      return;
    }

    // If editing the ebba application (only done by bank user),
    // there is no need to submit it to the bank.
    if (isActionTypeUpdate) {
      snackbar.showSuccess("Financial reports certification saved.");
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
          "Financial reports certification saved and submitted to Bespoke."
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
      } Financial Reports Certification`}
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
              } a financial reports certification on behalf of this
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
            If you have PRIOR month financial reports that were ADJUSTED after
            they were provided to Bespoke Financial, please upload those to the
            correct previous month certification.
          </Typography>
        </Alert>
      </Box>
    </Modal>
  );
}

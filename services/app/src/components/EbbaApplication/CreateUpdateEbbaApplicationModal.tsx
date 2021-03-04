import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
} from "@material-ui/core";
import EbbaApplicationForm from "components/EbbaApplication/EbbaApplicationForm";
import {
  Companies,
  ContractFragment,
  EbbaApplicationFilesInsertInput,
  EbbaApplications,
  EbbaApplicationsInsertInput,
  ProductTypeEnum,
  useAddEbbaApplicationMutation,
  useGetCompanyWithActiveContractQuery,
  useGetEbbaApplicationQuery,
  useUpdateEbbaApplicationMutation,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { authenticatedApi, ebbaApplicationsRoutes } from "lib/api";
import { ActionType } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: "200px",
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

function computeBorrowingBase(
  contract: ContractFragment | null,
  ebbaApplication: EbbaApplicationsInsertInput
): number | null {
  if (!contract || contract.product_type !== ProductTypeEnum.LineOfCredit) {
    return null;
  }

  const existingContractFields = contract.product_config.v1.fields;

  const accountsReceivablePercentage =
    existingContractFields.find(
      (field: any) =>
        field.internal_name === "borrowing_base_accounts_receivable_percentage"
    )?.value || 0;
  const inventoryPercentage =
    existingContractFields.find(
      (field: any) =>
        field.internal_name === "borrowing_base_inventory_percentage"
    )?.value || 0;
  const cashPercentage =
    existingContractFields.find(
      (field: any) => field.internal_name === "borrowing_base_cash_percentage"
    )?.value || 0;

  return (
    (ebbaApplication.monthly_accounts_receivable *
      accountsReceivablePercentage) /
      100 +
    (ebbaApplication.monthly_inventory * inventoryPercentage) / 100 +
    (ebbaApplication.monthly_cash * cashPercentage) / 100
  );
}

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  ebbaApplicationId: EbbaApplications["id"] | null;
  handleClose: () => void;
}

function CreateUpdateEbbaApplicationModal({
  actionType,
  companyId,
  ebbaApplicationId = null,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const { data } = useGetCompanyWithActiveContractQuery({
    variables: {
      companyId,
    },
  });

  const company = data?.companies_by_pk;
  const contract = company?.contract || null;

  // Default EbbaApplication for CREATE case.
  const newEbbaApplication = {
    application_date: null,
    monthly_accounts_receivable: "",
    monthly_inventory: "",
    monthly_cash: "",
    calculated_borrowing_base: "",
  } as EbbaApplicationsInsertInput;

  const [ebbaApplication, setEbbaApplication] = useState(newEbbaApplication);

  const [ebbaApplicationFiles, setEbbaApplicationFiles] = useState<
    EbbaApplicationFilesInsertInput[]
  >([]);

  const {
    loading: isExistingEbbaApplicationLoading,
  } = useGetEbbaApplicationQuery({
    skip: actionType === ActionType.New,
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

  const calculatedBorrowingBase = computeBorrowingBase(
    contract,
    ebbaApplication
  );
  const isDialogReady = !isExistingEbbaApplicationLoading;
  const isFormLoading =
    isAddEbbaApplicationLoading || isUpdateEbbaApplicationLoading;
  const isSubmitDisabled =
    isFormLoading ||
    !ebbaApplication.monthly_accounts_receivable ||
    !ebbaApplication.monthly_inventory ||
    !ebbaApplication.monthly_cash ||
    ebbaApplicationFiles.length <= 0;

  const upsertEbbaApplication = async () => {
    if (actionType === ActionType.Update) {
      const response = await updateEbbaApplication({
        variables: {
          id: ebbaApplication.id,
          ebbaApplication: {
            application_date: ebbaApplication.application_date,
            monthly_accounts_receivable:
              ebbaApplication.monthly_accounts_receivable,
            monthly_inventory: ebbaApplication.monthly_inventory,
            monthly_cash: ebbaApplication.monthly_cash,
            calculated_borrowing_base: calculatedBorrowingBase,
          },
          ebbaApplicationFiles,
        },
      });
      return response.data?.update_ebba_applications_by_pk;
    } else {
      const response = await addEbbaApplication({
        variables: {
          ebbaApplication: {
            application_date: ebbaApplication.application_date,
            monthly_accounts_receivable:
              ebbaApplication.monthly_accounts_receivable,
            monthly_inventory: ebbaApplication.monthly_inventory,
            monthly_cash: ebbaApplication.monthly_cash,
            calculated_borrowing_base: calculatedBorrowingBase,
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
    } else {
      const response = await authenticatedApi.post(
        ebbaApplicationsRoutes.submitForApproval,
        {
          ebba_application_id: savedEbbaApplication.id,
        }
      );
      if (response.data?.status === "ERROR") {
        snackbar.showError(`Error! Message: ${response.data?.msg}`);
      } else {
        snackbar.showSuccess(
          "Success! Borrowing base certification saved and submitted to Bespoke."
        );
        handleClose();
      }
    }
  };

  return isDialogReady ? (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {`${
          actionType === ActionType.Update ? "Edit" : "Create"
        } Borrowing Base Certification`}
      </DialogTitle>
      <DialogContent>
        <EbbaApplicationForm
          companyId={companyId}
          calculatedBorrowingBase={calculatedBorrowingBase}
          ebbaApplication={ebbaApplication}
          ebbaApplicationFiles={ebbaApplicationFiles}
          setEbbaApplication={setEbbaApplication}
          setEbbaApplicationFiles={setEbbaApplicationFiles}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          className={classes.submitButton}
          disabled={isSubmitDisabled}
          onClick={handleClickSubmit}
          variant={"contained"}
          color={"primary"}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default CreateUpdateEbbaApplicationModal;

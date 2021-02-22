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
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ContractFragment,
  EbbaApplicationFilesInsertInput,
  EbbaApplicationsInsertInput,
  ProductTypeEnum,
  useAddEbbaApplicationMutation,
  useGetCompanyWithActiveContractQuery,
} from "generated/graphql";
import { authenticatedApi, ebbaApplicationsRoutes } from "lib/api";
import { useContext, useState } from "react";
import EbbaApplicationForm from "./EbbaApplicationForm";

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
  handleClose: () => void;
}

function CreateEbbaApplicationModal({ handleClose }: Props) {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data } = useGetCompanyWithActiveContractQuery({
    variables: {
      companyId,
    },
  });

  const company = data?.companies_by_pk;
  const contract = company?.contract || null;

  // Default EbbaApplication for CREATE case.
  const newEbbaApplication = {
    application_month: "2021-02-01",
    monthly_accounts_receivable: "",
    monthly_inventory: "",
    monthly_cash: "",
    calculated_borrowing_base: "",
  } as EbbaApplicationsInsertInput;

  const [ebbaApplication, setEbbaApplication] = useState(newEbbaApplication);

  const [ebbaApplicationFiles, setEbbaApplicationFiles] = useState<
    EbbaApplicationFilesInsertInput[]
  >([]);

  const [
    addEbbaApplication,
    { loading: isAddEbbaApplicationLoading },
  ] = useAddEbbaApplicationMutation();

  const calculatedBorrowingBase = computeBorrowingBase(
    contract,
    ebbaApplication
  );
  const isFormLoading = isAddEbbaApplicationLoading;
  const isSubmitDisabled =
    isFormLoading ||
    !ebbaApplication.monthly_accounts_receivable ||
    !ebbaApplication.monthly_inventory ||
    !ebbaApplication.monthly_cash ||
    ebbaApplicationFiles.length <= 0;

  const handleClickSubmit = async () => {
    const response = await addEbbaApplication({
      variables: {
        ebbaApplication: {
          application_month: ebbaApplication.application_month,
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
    const savedEbbaApplication = response.data?.insert_ebba_applications_one;
    if (!savedEbbaApplication) {
      alert("Could not create borrowing base");
    } else {
      const response = await authenticatedApi.post(
        ebbaApplicationsRoutes.submitForApproval,
        {
          ebba_application_id: savedEbbaApplication.id,
        }
      );
      if (response.data?.status === "ERROR") {
        alert(response.data?.msg);
      } else {
        handleClose();
      }
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Submit Borrowing Base Certification
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
  );
}

export default CreateEbbaApplicationModal;

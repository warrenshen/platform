import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import InvoiceForm from "components/Invoices/InvoiceForm";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  InvoiceFileFragment,
  InvoiceFileTypeEnum,
  InvoicesInsertInput,
  RequestStatusEnum,
  useGetInvoiceByIdQuery,
  usePayorsByPartnerCompanyQuery,
  UserRolesEnum,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createInvoiceMutation,
  submitInvoiceForApproval,
  submitNewInvoiceForPaymentMutation,
  updateInvoiceMutation,
} from "lib/api/invoices";
import { ActionType } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

const mapFiles = (files: any[]) =>
  !files
    ? []
    : files.map((f) => ({
        invoice_id: f.invoice_id,
        file_id: f.file_id,
        file_type: f.file_type,
      }));

/*
isInvoiceForLoan
true: new invoice is for loan (requires approval by Payor).
false: new invoice is for payment (does not require approval by Payor).
*/
interface Props {
  isInvoiceForLoan: boolean;
  actionType: ActionType;
  companyId: Companies["id"];
  invoiceId: string | null;
  handleClose: () => void;
}

function CreateUpdateInvoiceModal({
  isInvoiceForLoan,
  actionType,
  companyId,
  handleClose,
  invoiceId = null,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = role === UserRolesEnum.BankAdmin;

  const newInvoice = {
    company_id: companyId,
    payor_id: null,
    invoice_number: "",
    invoice_date: null,
    invoice_due_date: null,
    subtotal_amount: null,
    total_amount: null,
    taxes_amount: null,
    advance_date: null,
    is_cannabis: false,
    status: RequestStatusEnum.Drafted,
  } as InvoicesInsertInput;

  const [invoice, setInvoice] = useState(newInvoice);

  const [invoiceFile, setInvoiceFile] = useState<InvoiceFileFragment>();

  const { data, loading: isPayorsLoading } = usePayorsByPartnerCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });
  const payors = data?.payors || [];

  const { loading: isExistingInvoiceLoading } = useGetInvoiceByIdQuery({
    skip: actionType === ActionType.New,
    fetchPolicy: "network-only",
    variables: {
      id: invoiceId,
    },
    onCompleted: (data) => {
      const existingInvoice = data?.invoices_by_pk;
      if (!existingInvoice || actionType !== ActionType.Update) return;
      setInvoice(
        mergeWith(newInvoice, existingInvoice, (a, b) => (isNull(b) ? a : b))
      );
      setInvoiceFile(
        existingInvoice.invoice_files.filter(
          (f) => f.file_type === InvoiceFileTypeEnum.Invoice
        )[0]
      );
    },
  });

  const [
    createInvoice,
    { loading: isCreateInvoiceLoading },
  ] = useCustomMutation(createInvoiceMutation);

  const [
    updateInvoice,
    { loading: isUpdateInvoiceLoading },
  ] = useCustomMutation(updateInvoiceMutation);

  const [
    submitNewInvoiceForPayment,
    { loading: isSubmitNewInvoiceForPaymentLoading },
  ] = useCustomMutation(submitNewInvoiceForPaymentMutation);

  const upsertInvoice = async () => {
    const files = [...mapFiles([invoiceFile].filter((f) => !!f))];

    const fn = actionType === ActionType.New ? createInvoice : updateInvoice;
    return await fn({
      variables: {
        invoice,
        files,
      },
    });
  };

  const handleSaveDraft = async () => {
    const result = await upsertInvoice();
    if (result.status === "ERROR") {
      snackbar.showError(`Error! Message: ${result.msg}`);
    } else {
      snackbar.showSuccess("Success! Invoice saved as draft");
      handleClose();
    }
  };

  const handleSaveSubmit = async () => {
    const result = await upsertInvoice();
    if (result.status === "ERROR") {
      snackbar.showError(`Error! Message: ${result.msg}`);
      return;
    }

    if (result.data && result.data.invoice) {
      if (isInvoiceForLoan) {
        const response = await submitInvoiceForApproval({
          variables: {
            id: result.data.invoice.id,
          },
        });

        if (response.status !== "OK") {
          snackbar.showError(`Error! Message: ${response.msg}`);
        } else {
          snackbar.showSuccess(
            "Success! Invoice saved and submitted to payor for approval."
          );
          handleClose();
        }
      } else {
        const response = await submitNewInvoiceForPayment({
          variables: {
            invoice_id: result.data.invoice.id,
          },
        });

        if (response.status !== "OK") {
          snackbar.showError(`Error! Message: ${response.msg}`);
        } else {
          snackbar.showSuccess("Success! Invoice sent to payor for payment.");
          handleClose();
        }
      }
    }
  };

  const isReady = !isExistingInvoiceLoading && !isPayorsLoading;
  const isFormValid = !!invoice.payor_id;
  const isFormLoading =
    isCreateInvoiceLoading ||
    isUpdateInvoiceLoading ||
    isSubmitNewInvoiceForPaymentLoading;
  const isSaveDraftDisabled =
    !isFormValid || isFormLoading || !invoice.invoice_number;
  const isSaveSubmitDisabled =
    isSaveDraftDisabled ||
    !payors.find((p) => p.id === invoice.payor_id)
      ?.company_payor_partnerships[0].approved_at ||
    !invoice.invoice_number ||
    !invoice.invoice_date ||
    !invoice.invoice_due_date ||
    (isInvoiceForLoan && !invoice.advance_date) ||
    !invoice.subtotal_amount ||
    !invoice.total_amount ||
    !invoiceFile;

  // Do not attempt a render unless we're ready
  if (!isReady) {
    return null;
  }

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {`${actionType === ActionType.Update ? "Edit" : "Create"} Invoice`}
      </DialogTitle>
      <DialogContent>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are ${
                  actionType === ActionType.Update ? "editing" : "creating"
                } an invoice on behalf of this
                customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        )}
        <InvoiceForm
          isInvoiceForLoan={isInvoiceForLoan}
          companyId={companyId}
          invoice={invoice}
          invoiceFile={invoiceFile}
          payors={payors}
          setInvoice={setInvoice}
          setInvoiceFile={setInvoiceFile}
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={isSaveDraftDisabled}
          onClick={handleSaveDraft}
          variant="outlined"
          color="default"
        >
          Save as Draft
        </Button>
        <Button
          className={classes.submitButton}
          disabled={isSaveSubmitDisabled}
          onClick={handleSaveSubmit}
          variant="contained"
          color="primary"
        >
          Save and Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateUpdateInvoiceModal;

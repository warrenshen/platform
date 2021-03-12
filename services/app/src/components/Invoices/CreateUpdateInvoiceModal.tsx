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
  InvoiceFileFragment,
  InvoiceFileTypeEnum,
  InvoicesInsertInput,
  RequestStatusEnum,
  useGetInvoiceByIdQuery,
  usePayorsByPartnerCompanyQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createInvoiceMutation,
  submitInvoiceForApproval,
  updateInvoiceMutation,
} from "lib/api/invoices";
import { ActionType } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";
import InvoiceForm from "./InvoiceForm";
interface Props {
  actionType: ActionType;
  invoiceId: string | null;
  handleClose: () => void;
}

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

export default function CreateUpdateInvoiceModal({
  actionType,
  handleClose,
  invoiceId = null,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const newInvoice = {
    company_id: companyId,
    payor_id: "",
    invoice_number: "",
    invoice_date: null,
    invoice_due_date: null,
    subtotal_amount: "",
    total_amount: "",
    taxes_amount: "",
    advance_date: null,
    is_cannabis: false,
    status: RequestStatusEnum.Drafted,
  } as InvoicesInsertInput;

  const [invoice, setInvoice] = useState(newInvoice);

  const [invoiceFile, setInvoiceFile] = useState<InvoiceFileFragment>();

  const [invoiceCannabisFiles, setInvoiceCannabisFiles] = useState<
    InvoiceFileFragment[]
  >([]);

  const { data, loading: isPayorsLoading } = usePayorsByPartnerCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });
  const payors = data?.payors || [];

  const { loading: isExistingInvoiceLoading } = useGetInvoiceByIdQuery({
    skip: actionType === ActionType.New,
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
      setInvoiceCannabisFiles(
        existingInvoice.invoice_files.filter(
          (f) => f.file_type === InvoiceFileTypeEnum.Cannabis
        )
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

  const upsertInvoice = async () => {
    const files = [
      ...mapFiles([invoiceFile].filter((f) => !!f)),
      ...mapFiles(invoiceCannabisFiles),
    ];

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
      snackbar.showError("Error! Could not upsert invoice");
    } else {
      snackbar.showSuccess("Success! Invoice saved as draft");
      handleClose();
    }
  };

  const handleSaveSubmit = async () => {
    const result = await upsertInvoice();
    if (result.status === "ERROR") {
      snackbar.showError("Error! Could not upsert invoice");
      return;
    }

    if (result.data && result.data.invoice) {
      const response = await submitInvoiceForApproval({
        variables: {
          id: result.data.invoice.id,
        },
      });

      if (response.status !== "OK") {
        snackbar.showError(`Error! Message: ${response.msg}`);
      } else {
        snackbar.showSuccess("Success! Invoice saved and submitted!");
      }
    }

    handleClose();
  };

  const isReady = !isExistingInvoiceLoading && !isPayorsLoading;
  const isFormValid = !!invoice.payor_id;
  const isFormLoading = isCreateInvoiceLoading || isUpdateInvoiceLoading;
  const isSaveDraftDisabled =
    !isFormValid || isFormLoading || !invoice.invoice_number;
  const isSaveSubmitDisabled =
    isSaveDraftDisabled ||
    !payors.find((p) => p.id === invoice.payor_id)
      ?.company_payor_partnerships[0].approved_at ||
    !invoice.invoice_number ||
    !invoice.invoice_date ||
    !invoice.invoice_due_date ||
    !invoice.advance_date ||
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
        <InvoiceForm
          companyId={companyId}
          invoice={invoice}
          invoiceFile={invoiceFile}
          invoiceCannabisFiles={invoiceCannabisFiles}
          payors={payors}
          setInvoice={setInvoice}
          setInvoiceFile={setInvoiceFile}
          setInvoiceCannabisFiles={setInvoiceCannabisFiles}
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={isSaveDraftDisabled}
          onClick={handleSaveDraft}
          variant="contained"
          color="secondary"
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

const mapFiles = (files: any[]) =>
  !files
    ? []
    : files.map((f) => ({
        invoice_id: f.invoice_id,
        file_id: f.file_id,
        file_type: f.file_type,
      }));

import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import InvoiceForm from "components/Invoices/InvoiceForm";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  InvoiceFileFragment,
  InvoiceFileTypeEnum,
  Invoices,
  InvoicesInsertInput,
  ProductTypeEnum,
  RequestStatusEnum,
  useGetInvoiceByIdQuery,
  usePayorsByPartnerCompanyQuery,
  Files,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createUpdateInvoiceAsDraftMutation,
  submitInvoiceForApproval,
  submitNewInvoiceForPaymentMutation,
} from "lib/api/invoices";
import { ActionType } from "lib/enum";
import { isInvoiceFinancingProductType } from "lib/settings";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";

/*
isInvoiceForLoan
true: new invoice is for loan (requires approval by Payor).
false: new invoice is for payment (does not require approval by Payor).
*/
interface Props {
  isInvoiceForLoan: boolean;
  actionType: ActionType;
  companyId: Companies["id"];
  invoiceId: Invoices["id"] | null;
  productType: ProductTypeEnum;
  handleClose: () => void;
}

export default function CreateUpdateInvoiceModal({
  isInvoiceForLoan,
  actionType,
  companyId,
  invoiceId = null,
  productType,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const newInvoice = {
    company_id: companyId,
    payor_id: null,
    invoice_number: "",
    invoice_date: null,
    invoice_due_date: null,
    subtotal_amount: null,
    total_amount: null,
    taxes_amount: null,
    is_cannabis: isInvoiceFinancingProductType(productType) ? true : null,
    status: RequestStatusEnum.Drafted,
  } as InvoicesInsertInput;

  const [invoice, setInvoice] = useState(newInvoice);

  const [invoiceFiles, setInvoiceFiles] = useState<InvoiceFileFragment[]>([]);
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

  const [frozenInvoiceFileIds, setFrozenInvoiceFileIds] = useState<
    Files["id"][]
  >([]);
  const [
    frozenInvoiceCannabisFileIds,
    setFrozenInvoiceCannabisFileIds,
  ] = useState<Files["id"][]>([]);

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
      setInvoiceFiles(
        existingInvoice.invoice_files.filter(
          (invoiceFile) => invoiceFile.file_type === InvoiceFileTypeEnum.Invoice
        )
      );
      setInvoiceCannabisFiles(
        existingInvoice.invoice_files.filter(
          (invoiceFile) =>
            invoiceFile.file_type === InvoiceFileTypeEnum.Cannabis
        )
      );

      // This must live here as to not freeze new files before submitting
      // Otherwise, it freezes new files on rerender
      let invoiceFileIds: Files["id"] = [];
      let invoiceCannabisFileIds: Files["id"] = [];
      existingInvoice.invoice_files.forEach((file) => {
        if (file.file_type === InvoiceFileTypeEnum.Cannabis) {
          invoiceCannabisFileIds.push(file.file_id);
        } else {
          invoiceFileIds.push(file.file_id);
        }
      });
      setFrozenInvoiceFileIds(invoiceFileIds);
      setFrozenInvoiceCannabisFileIds(invoiceCannabisFileIds);
    },
  });

  const [
    createUpdateInvoiceAsDraft,
    { loading: isCreateUpdateInvoiceAsDraftLoading },
  ] = useCustomMutation(createUpdateInvoiceAsDraftMutation);

  const [
    submitNewInvoiceForPayment,
    { loading: isSubmitNewInvoiceForPaymentLoading },
  ] = useCustomMutation(submitNewInvoiceForPaymentMutation);

  const upsertInvoice = async () => {
    const invoiceFilesData = prepareInvoiceFiles();

    const response = await createUpdateInvoiceAsDraft({
      variables: {
        invoice: {
          id: actionType === ActionType.Update ? invoiceId : null,
          company_id: companyId,
          payor_id: invoice.payor_id,
          invoice_number: invoice.invoice_number,
          subtotal_amount: invoice.subtotal_amount,
          taxes_amount: invoice.taxes_amount,
          total_amount: invoice.total_amount,
          invoice_date: invoice.invoice_date,
          invoice_due_date: invoice.invoice_due_date,
          is_cannabis: invoice.is_cannabis,
          status: RequestStatusEnum.Drafted,
        },
        invoice_files: invoiceFilesData,
      },
    });

    return response;
  };

  const prepareInvoiceFiles = () => {
    const invoiceFilesData = invoiceFiles.map((invoiceFile) => ({
      invoice_id: invoiceFile.invoice_id,
      file_id: invoiceFile.file_id,
      file_type: invoiceFile.file_type,
    }));
    const invoiceCannabisFilesData = invoiceCannabisFiles.map(
      (invoiceFile) => ({
        invoice_id: invoiceFile.invoice_id,
        file_id: invoiceFile.file_id,
        file_type: invoiceFile.file_type,
      })
    );
    return [...invoiceFilesData, ...invoiceCannabisFilesData];
  };

  const handleClickSaveDraft = async () => {
    const response = await upsertInvoice();

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not save invoice as draft. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Invoice saved as draft");
      handleClose();
    }
  };

  const handleClickSaveSubmit = async () => {
    const upsertResponse = await upsertInvoice();

    if (upsertResponse.status !== "OK") {
      snackbar.showError(
        `Could not save invoice. Error: ${upsertResponse.msg}`
      );
    }

    if (upsertResponse.data && upsertResponse.data.invoice_id) {
      if (isInvoiceForLoan) {
        const response = await submitInvoiceForApproval({
          variables: {
            id: upsertResponse.data.invoice_id,
          },
        });

        if (response.status !== "OK") {
          snackbar.showError(
            `Could not submit invoice. Error: ${response.msg}`
          );
        } else {
          snackbar.showSuccess(
            "Invoice saved and submitted to payor for approval."
          );
          handleClose();
        }
      } else {
        const response = await submitNewInvoiceForPayment({
          variables: {
            invoice_id: upsertResponse.data.invoice_id,
          },
        });

        if (response.status !== "OK") {
          snackbar.showError(
            `Could not submit invoice. Error: ${response.msg}`
          );
        } else {
          snackbar.showSuccess("Invoice saved and sent to payor for payment.");
          handleClose();
        }
      }
    }
  };

  const isReady = !isExistingInvoiceLoading && !isPayorsLoading;
  const isFormValid = !!invoice.payor_id;
  const isFormLoading =
    isCreateUpdateInvoiceAsDraftLoading || isSubmitNewInvoiceForPaymentLoading;
  const isSaveDraftDisabled =
    !isFormValid || isFormLoading || !invoice.invoice_number;
  const isSaveSubmitDisabled =
    isSaveDraftDisabled ||
    !payors.find((p) => p.id === invoice.payor_id)
      ?.company_payor_partnerships[0].approved_at ||
    !invoice.invoice_number ||
    !invoice.invoice_date ||
    !invoice.invoice_due_date ||
    !invoice.subtotal_amount ||
    !invoice.total_amount ||
    !invoiceFiles;

  // Do not attempt a render unless we're ready
  if (!isReady) {
    return null;
  }

  return (
    <Modal
      isPrimaryActionDisabled={isSaveSubmitDisabled}
      isSecondaryActionDisabled={isSaveDraftDisabled}
      title={`${actionType === ActionType.Update ? "Edit" : "Create"} Invoice`}
      primaryActionText={"Save and Submit"}
      secondaryActionText={"Save as Draft"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSaveSubmit}
      handleSecondaryAction={handleClickSaveDraft}
    >
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
        companyId={companyId}
        productType={productType}
        invoice={invoice}
        invoiceFiles={invoiceFiles}
        invoiceCannabisFiles={invoiceCannabisFiles}
        payors={payors}
        setInvoice={setInvoice}
        setInvoiceFiles={setInvoiceFiles}
        setInvoiceCannabisFiles={setInvoiceCannabisFiles}
        frozenInvoiceFileIds={frozenInvoiceFileIds}
        frozenInvoiceCannabisFileIds={frozenInvoiceCannabisFileIds}
      />
    </Modal>
  );
}

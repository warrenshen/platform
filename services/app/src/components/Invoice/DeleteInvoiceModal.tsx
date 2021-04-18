import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import InvoiceInfoCard from "components/Invoices/InvoiceInfoCard";
import Modal from "components/Shared/Modal/Modal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Invoices,
  useGetInvoiceByIdQuery,
  UserRolesEnum,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteInvoiceMutation } from "lib/api/invoices";
import { useContext } from "react";

interface Props {
  invoiceId: Invoices["id"] | null;
  handleClose: () => void;
}

export default function DeleteInvoiceModal({ invoiceId, handleClose }: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = role === UserRolesEnum.BankAdmin;

  const {
    data,
    loading: isExistingPurchaseOrderLoading,
  } = useGetInvoiceByIdQuery({
    fetchPolicy: "network-only",
    variables: {
      id: invoiceId,
    },
  });

  const invoice = data?.invoices_by_pk || null;

  const [
    deleteInvoice,
    { loading: isDeleteInvoiceLoading },
  ] = useCustomMutation(deleteInvoiceMutation);

  const handleClickSubmit = async () => {
    const response = await deleteInvoice({
      variables: {
        invoice_id: invoiceId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Error! Message: ${response.msg}`);
    } else {
      snackbar.showSuccess("Invoice deleted.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingPurchaseOrderLoading;
  const isFormLoading = isDeleteInvoiceLoading;
  const isSubmitDisabled = !isDialogReady || isFormLoading;

  return isDialogReady ? (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Delete Invoice"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={6}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are deleting a invoice on behalf of this
                customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        )}
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to delete the following invoice? You cannot
            undo this action.
          </Typography>
        </Box>
        {invoice && <InvoiceInfoCard invoice={invoice} />}
      </>
    </Modal>
  ) : null;
}

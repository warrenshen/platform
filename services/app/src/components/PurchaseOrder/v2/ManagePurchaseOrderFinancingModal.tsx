import { Box, Typography } from "@material-ui/core";
import PurchaseOrderInfoCard from "components/PurchaseOrder/PurchaseOrderInfoCard";
import Modal from "components/Shared/Modal/Modal";
import {
  PurchaseOrders,
  useGetPurchaseOrderForCustomerQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";

interface Props {
  purchaseOrderId: PurchaseOrders["id"];
  handleClose: () => void;
}

// TODO: PLACEHOLDER FOR https://www.notion.so/bespokefinancial/Edit-Financing-Request-Flow-Single-fb5352431b624f1ca89b8d022ac55f3e
function ManagePurchaseOrderFinancingModal({
  purchaseOrderId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const { data, loading: isExistingPurchaseOrderLoading } =
    useGetPurchaseOrderForCustomerQuery({
      fetchPolicy: "network-only",
      variables: {
        id: purchaseOrderId,
      },
    });

  const purchaseOrder = data?.purchase_orders_by_pk || null;

  const handleClickSubmit = async () => {
    snackbar.showSuccess("Purchase order updated.");
  };

  const isDialogReady = !isExistingPurchaseOrderLoading;

  return isDialogReady ? (
    <Modal
      title={"Manage Purchase Order Financing"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box>
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to edit the following purchase order? You
            cannot undo this action.
          </Typography>
        </Box>
        {purchaseOrder && (
          <PurchaseOrderInfoCard purchaseOrder={purchaseOrder} />
        )}
      </Box>
    </Modal>
  ) : null;
}

export default ManagePurchaseOrderFinancingModal;

import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import { PurchaseOrders } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";

interface Props {
  purchaseOrderIds: PurchaseOrders["id"][];
  handleClose: () => void;
}

// TODO: PLACEHOLDER FOR https://www.notion.so/bespokefinancial/Edit-Financing-Request-Flow-Multiple-a0d6713f071b4ae08d0fa89f869aa5da
function ManagePurchaseOrderFinancingModalMultiple({
  purchaseOrderIds,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const handleClickSubmit = async () => {
    snackbar.showSuccess("Purchase order updated.");
  };

  return (
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
      </Box>
    </Modal>
  );
}

export default ManagePurchaseOrderFinancingModalMultiple;

import { Box, DialogActions, DialogContent } from "@material-ui/core";
import PrimaryWarningButton from "components/Shared/Button/PrimaryWarningButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import CardLine from "components/Shared/Card/CardLine";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { PurchaseOrders } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { archivePurchaseOrderMultipleMutation } from "lib/api/purchaseOrders";

interface Props {
  purchaseOrderIds: PurchaseOrders["id"][];
  purchaseOrderNumbers: PurchaseOrders["order_number"][];
  handleClose: () => void;
}

const ArchivePurchaseOrderModalMultiple = ({
  purchaseOrderIds,
  purchaseOrderNumbers,
  handleClose,
}: Props) => {
  const snackbar = useSnackbar();

  const [archivePurchaseOrderMultiple, { loading }] = useCustomMutation(
    archivePurchaseOrderMultipleMutation
  );

  const handleClickConfirm = async () => {
    const response = await archivePurchaseOrderMultiple({
      variables: {
        purchase_order_ids: purchaseOrderIds,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not archive purchase orders. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Successfully archived purchase orders");
      handleClose();
    }
  };

  return (
    <ModalDialog title={"Archive Purchase Orders"} handleClose={handleClose}>
      <DialogContent>
        <Text textVariant={TextVariants.Paragraph} bottomMargin={32}>
          {"Are you sure you want to archive the following purchase orders?"}
        </Text>
        {purchaseOrderNumbers.map((purchaseOrderNumber) => (
          <CardLine
            labelText={"PO number"}
            valueText={purchaseOrderNumber}
            valueAlignment="left"
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Box display="flex" style={{ margin: 24, padding: 0 }}>
          <SecondaryButton
            dataCy={"archive-po-cancel-button"}
            text={"Cancel"}
            onClick={handleClose}
          />
          <PrimaryWarningButton
            dataCy={"archive-po-confirm-button"}
            isDisabled={loading}
            text={"Confirm"}
            onClick={handleClickConfirm}
          />
        </Box>
      </DialogActions>
    </ModalDialog>
  );
};

export default ArchivePurchaseOrderModalMultiple;

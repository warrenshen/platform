import {
  Box,
  DialogActions,
  DialogContent,
  TextField,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import PrimaryWarningButton from "components/Shared/Button/PrimaryWarningButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { rejectPurchaseOrderMutation } from "lib/api/purchaseOrders";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
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

interface Props {
  purchaseOrderId: string;
  linkVal?: string; // the link value used to generate this one-time reject ability
  handleClose: () => void;
  handleRejectSuccess: () => void;
}

function ReviewPurchaseOrderRejectModal({
  purchaseOrderId,
  linkVal = "",
  handleClose,
  handleRejectSuccess,
}: Props) {
  const { user } = useContext(CurrentUserContext);
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [rejectionNote, setRejectionNote] = useState("");

  const [rejectPurchaseOrder, { loading: isRejectPurchaseOrderLoading }] =
    useCustomMutation(rejectPurchaseOrderMutation);

  const handleClickReject = async () => {
    const response = await rejectPurchaseOrder({
      variables: {
        purchase_order_id: purchaseOrderId,
        rejection_note: rejectionNote,
        rejected_by_user_id: !!user?.id || null,
        link_val: linkVal,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Error! Something went wrong. Reason: ${response.data?.msg}`
      );
    } else {
      handleRejectSuccess();
    }
  };

  const isSubmitDisabled = !rejectionNote || isRejectPurchaseOrderLoading;

  return (
    <ModalDialog title={"Reject Completely"} handleClose={handleClose}>
      <DialogContent>
        <Text textVariant={TextVariants.Paragraph} color={SecondaryTextColor}>
          Please enter in a reason for your rejection of the Purchase Order.
          After you are finished, press the "Confirm" button below.
        </Text>
        <Box display="flex" flexDirection="column">
          <TextField
            data-cy={"rejection-reason"}
            multiline
            label={"Rejection Reason"}
            placeholder={"Enter in the reason for rejection"}
            value={rejectionNote}
            onChange={({ target: { value } }) => setRejectionNote(value)}
          />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <SecondaryButton
          dataCy={"vendor-reject-po-modal-cancel-button"}
          text={"Cancel"}
          onClick={handleClose}
        />
        <PrimaryWarningButton
          dataCy={"vendor-reject-po-modal-confirm-button"}
          isDisabled={isSubmitDisabled}
          text={"Confirm"}
          onClick={handleClickReject}
        />
      </DialogActions>
    </ModalDialog>
  );
}

export default ReviewPurchaseOrderRejectModal;

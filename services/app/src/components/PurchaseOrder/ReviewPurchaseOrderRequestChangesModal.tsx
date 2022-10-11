import {
  Box,
  DialogActions,
  DialogContent,
  TextField,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { requestPurchaseOrderChangesMutation } from "lib/api/purchaseOrders";
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
  handleRequestChangesSuccess: () => void;
}

export default function ReviewPurchaseOrderRequestChangesModal({
  purchaseOrderId,
  linkVal = "",
  handleClose,
  handleRequestChangesSuccess,
}: Props) {
  const { user } = useContext(CurrentUserContext);
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [requestedChanges, setRequestedChanges] = useState("");

  const [
    requestPurchaseOrderChanges,
    { loading: isRequestPurchaseOrderChangesLoading },
  ] = useCustomMutation(requestPurchaseOrderChangesMutation);

  const handleClickRequestChanges = async () => {
    const response = await requestPurchaseOrderChanges({
      variables: {
        purchase_order_id: purchaseOrderId,
        requested_changes_note: requestedChanges,
        requested_by_user_id: !!user?.id || null,
        link_val: linkVal,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Error! Something went wrong. Reason: ${response.data?.msg}`
      );
    } else {
      handleRequestChangesSuccess();
    }
  };

  const isSubmitDisabled =
    !requestedChanges || isRequestPurchaseOrderChangesLoading;

  return (
    <ModalDialog title={"Request Changes"} handleClose={handleClose}>
      <DialogContent>
        <Text textVariant={TextVariants.Paragraph} color={SecondaryTextColor}>
          Please enter in the change(s) you are requesting on the Purchase
          Order. After you are finished, press the "Confirm" button below.
        </Text>
        <Box display="flex" flexDirection="column">
          <TextField
            data-cy={"request-change-reason"}
            multiline
            label={"Requested Changes"}
            placeholder={"Enter in the requested changes"}
            value={requestedChanges}
            onChange={({ target: { value } }) => setRequestedChanges(value)}
          />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <SecondaryButton
          dataCy={"vendor-request-changes-po-modal-cancel-button"}
          text={"Cancel"}
          onClick={handleClose}
        />
        <PrimaryButton
          dataCy={"vendor-request-changes-po-modal-confirm-button"}
          isDisabled={isSubmitDisabled}
          text={"Confirm"}
          onClick={handleClickRequestChanges}
        />
      </DialogActions>
    </ModalDialog>
  );
}

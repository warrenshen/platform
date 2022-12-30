import {
  Box,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
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
import { LoanFragment, LoanTypeEnum } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
import { rejectLoanNewMutation } from "lib/api/loans";
import { useState } from "react";

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
  loan: LoanFragment;
  handleClose: () => void;
}

const ReviewFinancingRequestRejectModal = ({ loan, handleClose }: Props) => {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [rejectionNote, setRejectionNote] = useState("");
  const [rejectRelatedPurchaseOrder, setRejectRelatedPurchaseOrder] =
    useState<boolean>(false);
  const [isVendorApprovalRequired, setIsVendorApprovalRequired] =
    useState<boolean>(false);
  const [rejectLoan, { loading: isRejectLoanLoading }] = useCustomMutation(
    rejectLoanNewMutation
  );

  const handleClickReject = async () => {
    const response = await rejectLoan({
      variables: {
        loan_id: loan.id,
        rejection_note: rejectionNote,
        reject_related_purchase_order: rejectRelatedPurchaseOrder,
        is_vendor_approval_required: isVendorApprovalRequired,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Error! Something went wrong. Reason: ${response.data?.msg}`
      );
    } else {
      snackbar.showSuccess("Financing request rejected successfully");
      handleClose();
    }
  };

  const isSubmitDisabled = !rejectionNote || isRejectLoanLoading;

  return (
    <ModalDialog title={"Reject Financing Request"} handleClose={handleClose}>
      <DialogContent>
        {loan.loan_type === LoanTypeEnum.PurchaseOrder && (
          <Box mb={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rejectRelatedPurchaseOrder}
                  onChange={(event) =>
                    setRejectRelatedPurchaseOrder(event.target.checked)
                  }
                  color="primary"
                  icon={<CustomCheckboxUnchecked />}
                  checkedIcon={<CustomCheckboxChecked />}
                />
              }
              label={"Completely reject related purchase order?"}
              disabled={isVendorApprovalRequired}
            />
          </Box>
        )}
        <Text
          textVariant={TextVariants.Paragraph}
          color={SecondaryTextColor}
          bottomMargin={36}
        >
          Please enter in a reason for your rejection of the financing request.
          After you are finished, press the “confirm” button below.
        </Text>
        <Box mb={3}>
          <FormControl fullWidth>
            <TextField
              data-cy={"rejection-reason"}
              multiline
              label={"Rejection Reason"}
              placeholder={"Enter in the reason for rejection"}
              value={rejectionNote}
              onChange={({ target: { value } }) => setRejectionNote(value)}
            />
          </FormControl>
        </Box>
        {loan.loan_type === LoanTypeEnum.PurchaseOrder && (
          <Box mb={5}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isVendorApprovalRequired}
                  onChange={(event) =>
                    setIsVendorApprovalRequired(event.target.checked)
                  }
                  color="primary"
                  icon={<CustomCheckboxUnchecked />}
                  checkedIcon={<CustomCheckboxChecked />}
                />
              }
              label={"Is vendor approval required?"}
              disabled={rejectRelatedPurchaseOrder}
            />
          </Box>
        )}
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
};

export default ReviewFinancingRequestRejectModal;

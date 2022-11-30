import {
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { ChangeEvent, useState } from "react";

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
  title: string;
  errorMessage: string;
  isEmailWarningShown?: boolean;
  handleConfirm: () => void;
  handleClose: () => void;
}

function ConfirmModal({
  title,
  errorMessage,
  isEmailWarningShown = false,
  handleConfirm,
  handleClose,
}: Props) {
  const classes = useStyles();

  const [isEmailStepConfirmed, setIsEmailStepConfirmed] = useState(
    !isEmailWarningShown
  );

  return (
    <ModalDialog title={"Approve Vendor Partnership"} handleClose={handleClose}>
      <DialogContent>
        {!!errorMessage && (
          <Typography color="error" gutterBottom={true}>
            {errorMessage}
          </Typography>
        )}
        {isEmailWarningShown && (
          <>
            <Text textVariant={TextVariants.Paragraph}>
              Press confirm to approve this vendor partnership. An email
              notification will be sent to vendor users associated with this
              vendor partnership stating that this partnership has been
              approved.
            </Text>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isEmailStepConfirmed}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setIsEmailStepConfirmed(event.target.checked)
                  }
                  color="primary"
                />
              }
              label={
                "I understand the vendor users associated with this partnership will receive an email notification stating that this partnership has been approved."
              }
            />
          </>
        )}
        {!isEmailWarningShown && (
          <Text textVariant={TextVariants.Paragraph}>
            Press Confirm to approve this vendor partnership. No email
            notification will be sent to vendor users associated with this
            vendor partnership.
          </Text>
        )}
        <DialogActions className={classes.dialogActions}>
          <SecondaryButton
            dataCy={"vendor-partnership-approval-modal-cancel-button"}
            text={"Cancel"}
            onClick={handleClose}
          />
          <PrimaryButton
            dataCy={"vendor-partnership-approval-po-modal-confirm-button"}
            isDisabled={isEmailWarningShown && !isEmailStepConfirmed}
            text={"Confirm"}
            onClick={handleConfirm}
          />
        </DialogActions>
      </DialogContent>
    </ModalDialog>
  );
}

export default ConfirmModal;

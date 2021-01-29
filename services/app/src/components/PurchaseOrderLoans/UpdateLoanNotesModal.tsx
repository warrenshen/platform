import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import {
  LoansInsertInput,
  useLoanQuery,
  useUpdateLoanMutation,
} from "generated/graphql";
import { isNull, mergeWith } from "lodash";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: "500px",
    },
    dialogTitle: {
      paddingLeft: theme.spacing(4),
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: 400,
    },
    dialogActions: {
      margin: theme.spacing(4),
      marginTop: 0,
      marginBottom: 15,
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  loanId: string;
  handleClose: () => void;
}

function UpdateLoanNotesModal({ loanId, handleClose }: Props) {
  const classes = useStyles();

  // Default Loan for initialization.
  const newLoan = {
    notes: "",
  } as LoansInsertInput;

  const [loan, setLoan] = useState(newLoan);

  const { loading: isExistingLoanLoading } = useLoanQuery({
    fetchPolicy: "network-only",
    variables: {
      id: loanId,
    },
    onCompleted: (data) => {
      const existingLoan = data?.loans_by_pk;
      if (existingLoan) {
        setLoan(
          mergeWith(newLoan, existingLoan, (a, b) => (isNull(b) ? a : b))
        );
      }
    },
  });

  const [
    updateLoan,
    { loading: isUpdateLoanLoading },
  ] = useUpdateLoanMutation();

  const handleClickSave = async () => {
    const response = await updateLoan({
      variables: {
        id: loan.id,
        loan: {
          notes: loan.notes,
        },
      },
    });
    const savedLoan = response.data?.update_loans_by_pk;
    if (!savedLoan) {
      alert("Could not update loan");
    }
    handleClose();
  };

  const isDialogReady = !isExistingLoanLoading;
  const isFormLoading = isUpdateLoanLoading;
  const isSaveDisabled = isFormLoading;

  return isDialogReady ? (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Edit Internal Note
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <TextField
            multiline
            label={"Internal Note"}
            placeholder={"Enter in internal note"}
            value={loan.notes}
            onChange={({ target: { value } }) =>
              setLoan({
                ...loan,
                notes: value,
              })
            }
          ></TextField>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={isSaveDisabled}
            onClick={handleClickSave}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default UpdateLoanNotesModal;

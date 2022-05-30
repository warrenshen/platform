import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  LoansInsertInput,
  useGetLoanQuery,
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
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: 400,
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
  loanId: string;
  handleClose: () => void;
}

export default function UpdateLoanNotesModal({ loanId, handleClose }: Props) {
  const classes = useStyles();

  // Default Loan for initialization.
  const newLoan = {
    notes: "",
  } as LoansInsertInput;

  const [loan, setLoan] = useState(newLoan);

  const { loading: isExistingLoanLoading } = useGetLoanQuery({
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

  const [updateLoan, { loading: isUpdateLoanLoading }] =
    useUpdateLoanMutation();

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

  if (!isDialogReady) {
    return null;
  }

  return (
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
            autoFocus
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
          />
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
  );
}

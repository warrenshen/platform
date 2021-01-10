import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ListPurchaseOrderLoansForCustomerDocument,
  useAddPurchaseOrderLoanMutation,
  useListApprovedPurchaseOrdersQuery,
} from "generated/graphql";
import { useContext, useState } from "react";

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
      width: "200px",
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
  handleClose: () => void;
}

type Loan = {
  purchase_order_id: string;
  amount: number;
};

function AddLoanModal(props: Props) {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const {
    data: approvedPOsData,
    loading: isLoadingPOs,
  } = useListApprovedPurchaseOrdersQuery();
  const approvedPOs = approvedPOsData?.purchase_orders;

  const [addPOLoanMutation] = useAddPurchaseOrderLoanMutation();

  const [loan, setLoan] = useState<Loan>({ purchase_order_id: "", amount: 0 });

  const handleSubmit = async () => {
    const response = await addPOLoanMutation({
      variables: {
        purchaseOrderId: loan.purchase_order_id,
        amount: loan.amount,
      },
      refetchQueries: [
        {
          query: ListPurchaseOrderLoansForCustomerDocument,
          variables: {
            companyId: companyId,
          },
        },
      ],
    });
    console.log(response);
    props.handleClose();
  };

  return (
    <Dialog
      open
      onClose={props.handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Create Purchase Order Loan
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row">
            <FormControl className={classes.purchaseOrderInput}>
              <InputLabel id="purchase-order-select-label">
                Purchase Order
              </InputLabel>
              <Select
                disabled={isLoadingPOs}
                labelId="purchase-order-select-label"
                id="purchase-order-select"
                value={loan.purchase_order_id}
                onChange={({ target: { value } }) => {
                  setLoan({
                    ...loan,
                    purchase_order_id: value as string,
                  });
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {approvedPOs?.map((purchase_order) => (
                  <MenuItem key={purchase_order.id} value={purchase_order.id}>
                    {purchase_order.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box mt={3}>
            <FormControl fullWidth className={classes.purchaseOrderInput}>
              <InputLabel htmlFor="standard-adornment-amount">
                Amount
              </InputLabel>
              <Input
                id="standard-adornment-amount"
                type="number"
                value={loan.amount <= 0 ? "" : loan.amount}
                onChange={({ target: { value } }) => {
                  window.console.log(value);
                  setLoan({
                    ...loan,
                    amount:
                      value.trim().length > 0 ? parseFloat(value.trim()) : 0,
                  });
                }}
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={props.handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={loan.amount <= 0 || !loan.purchase_order_id}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AddLoanModal;

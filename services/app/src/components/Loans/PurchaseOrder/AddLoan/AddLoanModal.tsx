import DateFnsUtils from "@date-io/date-fns";
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import InfoCard from "components/Shared/PurchaseOrder/InfoCard";
import InputCurrencyAutoFormatter from "components/Shared/InputCurrencyAutoFormatter";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ListPurchaseOrderLoansForCustomerDocument,
  PurchaseOrderLoansInsertInput,
  RequestStatusEnum,
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
  handleClose: () => void;
}

function AddLoanModal({ handleClose }: Props) {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const {
    data: approvedPOsData,
    loading: isLoadingPOs,
  } = useListApprovedPurchaseOrdersQuery({
    fetchPolicy: "network-only",
  });
  const approvedPOs = approvedPOsData?.purchase_orders;

  // Default PurchaseOrderLoan for CREATE case.
  const loanForm = {
    purchase_order_id: "",
    origination_date: "",
    maturity_date: "",
    adjusted_maturity_date: "",
    amount: "",
    status: RequestStatusEnum.Drafted,
  };
  const [loan, setLoan] = useState<PurchaseOrderLoansInsertInput>({
    ...loanForm,
    ...{},
  });

  const [
    addPOLoanMutation,
    { loading: isLoadingAddPurchaseOrderLoan },
  ] = useAddPurchaseOrderLoanMutation();

  const insertPurchaseOrderLoanWithStatus = async (
    status: RequestStatusEnum
  ) => {
    const dateInFifteenDays = new Date(
      new Date().getTime() + 15 * 24 * 60 * 60 * 1000
    );
    await addPOLoanMutation({
      variables: {
        purchaseOrderLoan: {
          purchase_order_id: loan.purchase_order_id,
          origination_date: loan.origination_date || null,
          maturity_date: dateInFifteenDays,
          adjusted_maturity_date: dateInFifteenDays,
          amount: loan.amount || null,
          status: status,
        },
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
  };

  const handleClickSaveDraft = async () => {
    insertPurchaseOrderLoanWithStatus(RequestStatusEnum.Drafted);
    handleClose();
  };

  const handleClickSaveSubmit = async () => {
    insertPurchaseOrderLoanWithStatus(RequestStatusEnum.ApprovalRequested);
    handleClose();
  };

  const isFormValid = !!loan.purchase_order_id;
  const isFormLoading = isLoadingPOs;
  const isSaveDraftDisabled = !isFormValid || isLoadingAddPurchaseOrderLoan;
  const isSaveSubmitDisabled =
    !isFormValid || isFormLoading || !loan.origination_date || !loan.amount;

  const selectedPurchaseOrder = approvedPOs?.find(
    (po) => po.id === loan.purchase_order_id
  );

  return (
    <Dialog
      open
      onClose={handleClose}
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
                  const po = approvedPOs?.find((po) => po.id === value);
                  setLoan({
                    ...loan,
                    purchase_order_id: value as string,
                    amount: po?.amount,
                  });
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {approvedPOs?.map((purchase_order) => (
                  <MenuItem key={purchase_order.id} value={purchase_order.id}>
                    {`${purchase_order.vendor?.name} - $${Intl.NumberFormat(
                      "en-US"
                    ).format(purchase_order.amount)} - ${
                      purchase_order.delivery_date
                    }`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" mt={3}>
            {selectedPurchaseOrder ? (
              <InfoCard purchaseOrder={selectedPurchaseOrder} />
            ) : (
              <Box>Purchase Order not selected yet</Box>
            )}
          </Box>
          <Box>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                className={classes.purchaseOrderInput}
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                id="origination-date-date-picker"
                label="Origination Date"
                value={loan.origination_date || null}
                onChange={(value: MaterialUiPickersDate) => {
                  setLoan({
                    ...loan,
                    origination_date: value ? value : new Date().getUTCDate(),
                  });
                }}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </MuiPickersUtilsProvider>
          </Box>
          <Box mt={3}>
            <FormControl fullWidth className={classes.purchaseOrderInput}>
              <InputCurrencyAutoFormatter
                label="Amount"
                defaultValue={loan.amount}
                onChange={(value) => {
                  setLoan({
                    ...loan,
                    amount: value,
                  });
                }}
              />
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={isSaveDraftDisabled}
            onClick={handleClickSaveDraft}
            variant={"contained"}
            color={"secondary"}
          >
            Save as Draft
          </Button>
          <Button
            className={classes.submitButton}
            disabled={isSaveSubmitDisabled}
            onClick={handleClickSaveSubmit}
            variant="contained"
            color="primary"
          >
            Save and Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AddLoanModal;

import DateFnsUtils from "@date-io/date-fns";
import {
  Box,
  createStyles,
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
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import PurchaseOrderInfoCard from "components/Shared/PurchaseOrder/PurchaseOrderInfoCard";
import {
  PurchaseOrderFragment,
  PurchaseOrderLoansInsertInput,
} from "generated/graphql";

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
  purchaseOrderLoan: PurchaseOrderLoansInsertInput;
  setPurchaseOrderLoan: (
    purchaseOrderLoan: PurchaseOrderLoansInsertInput
  ) => void;
  approvedPurchaseOrders: PurchaseOrderFragment[];
  selectedPurchaseOrder?: PurchaseOrderFragment;
}

function PurchaseOrderLoanForm({
  purchaseOrderLoan,
  setPurchaseOrderLoan,
  approvedPurchaseOrders,
  selectedPurchaseOrder,
}: Props) {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row">
        <FormControl className={classes.purchaseOrderInput}>
          <InputLabel id="purchase-order-select-label">
            Purchase Order
          </InputLabel>
          <Select
            disabled={approvedPurchaseOrders.length <= 0}
            labelId="purchase-order-select-label"
            id="purchase-order-select"
            value={purchaseOrderLoan.purchase_order_id}
            onChange={({ target: { value } }) => {
              const selectedPurchaseOrder = approvedPurchaseOrders?.find(
                (purchaseOrder) => purchaseOrder.id === value
              );
              setPurchaseOrderLoan({
                ...purchaseOrderLoan,
                purchase_order_id: selectedPurchaseOrder?.id,
                amount: selectedPurchaseOrder?.amount,
              });
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {approvedPurchaseOrders?.map((purchaseOrder) => (
              <MenuItem key={purchaseOrder.id} value={purchaseOrder.id}>
                {`${purchaseOrder.vendor?.name} - $${Intl.NumberFormat(
                  "en-US"
                ).format(purchaseOrder.amount)} - ${
                  purchaseOrder.delivery_date
                }`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" mt={3}>
        {selectedPurchaseOrder ? (
          <PurchaseOrderInfoCard purchaseOrder={selectedPurchaseOrder} />
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
            value={purchaseOrderLoan.origination_date}
            onChange={(value: MaterialUiPickersDate) => {
              setPurchaseOrderLoan({
                ...purchaseOrderLoan,
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
          <CurrencyTextField
            label="Amount"
            currencySymbol="$"
            outputFormat="string"
            textAlign="left"
            value={purchaseOrderLoan.amount}
            onChange={(_event: any, value: string) => {
              setPurchaseOrderLoan({
                ...purchaseOrderLoan,
                amount: value,
              });
            }}
          ></CurrencyTextField>
        </FormControl>
      </Box>
    </Box>
  );
}

export default PurchaseOrderLoanForm;

import {
  Box,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import PurchaseOrderInfoCard from "components/PurchaseOrder/PurchaseOrderInfoCard";
import DatePicker from "components/Shared/Dates/DatePicker";
import { LoansInsertInput, PurchaseOrderFragment } from "generated/graphql";
import { formatCurrency } from "lib/currency";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    purchaseOrderInput: {
      width: "200px",
    },
  })
);

interface Props {
  canEditPurchaseOrder: boolean;
  loan: LoansInsertInput;
  setLoan: (loan: LoansInsertInput) => void;
  approvedPurchaseOrders: PurchaseOrderFragment[];
  selectedPurchaseOrder?: PurchaseOrderFragment;
}

function PurchaseOrderLoanForm({
  canEditPurchaseOrder,
  loan,
  setLoan,
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
            disabled={
              !canEditPurchaseOrder || approvedPurchaseOrders.length <= 0
            }
            labelId="purchase-order-select-label"
            id="purchase-order-select"
            value={loan.artifact_id}
            onChange={({ target: { value } }) => {
              const selectedPurchaseOrder = approvedPurchaseOrders?.find(
                (purchaseOrder) => purchaseOrder.id === value
              );
              setLoan({
                ...loan,
                artifact_id: selectedPurchaseOrder?.id,
                amount: selectedPurchaseOrder?.amount,
              });
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {approvedPurchaseOrders?.map((purchaseOrder) => (
              <MenuItem key={purchaseOrder.id} value={purchaseOrder.id}>
                {`${purchaseOrder.order_number} - ${
                  purchaseOrder.vendor?.name
                } - ${formatCurrency(purchaseOrder.amount)} - ${
                  purchaseOrder.delivery_date
                }`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {selectedPurchaseOrder && (
        <Box display="flex" mt={3}>
          <PurchaseOrderInfoCard purchaseOrder={selectedPurchaseOrder} />
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={2}>
        <DatePicker
          className={classes.purchaseOrderInput}
          id="origination-date-date-picker"
          label="Payment Date"
          disablePast
          disableNonBankDays
          value={loan.requested_payment_date}
          onChange={(value) =>
            setLoan({
              ...loan,
              requested_payment_date: value,
            })
          }
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            The Payment Date is the date when the payment will arrive to the
            vendor and when interest charges begin.
          </Typography>
        </Box>
      </Box>
      <Box mt={3}>
        <FormControl fullWidth className={classes.purchaseOrderInput}>
          <CurrencyTextField
            label="Amount"
            currencySymbol="$"
            outputFormat="string"
            textAlign="left"
            value={loan.amount}
            onChange={(_event: any, value: string) =>
              setLoan({
                ...loan,
                amount: value,
              })
            }
          />
        </FormControl>
      </Box>
    </Box>
  );
}

export default PurchaseOrderLoanForm;

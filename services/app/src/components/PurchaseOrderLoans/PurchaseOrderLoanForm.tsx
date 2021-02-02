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
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import DatePicker from "components/Shared/Dates/DatePicker";
import PurchaseOrderInfoCard from "components/Shared/PurchaseOrder/PurchaseOrderInfoCard";
import {
  PurchaseOrderFragment,
  PurchaseOrderLoansInsertInput,
} from "generated/graphql";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    purchaseOrderInput: {
      width: "200px",
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
                loan: {
                  data: {
                    ...purchaseOrderLoan.loan?.data,
                    amount: selectedPurchaseOrder?.amount,
                  },
                },
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
                } - $${Intl.NumberFormat("en-US").format(
                  purchaseOrder.amount
                )} - ${purchaseOrder.delivery_date}`}
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
      <Box display="flex" flexDirection="column">
        <DatePicker
          className={classes.purchaseOrderInput}
          id="origination-date-date-picker"
          label="Payment Date"
          disablePast={true}
          disableNonBankDays={true}
          value={purchaseOrderLoan.loan?.data?.origination_date}
          onChange={(value: MaterialUiPickersDate) => {
            setPurchaseOrderLoan({
              ...purchaseOrderLoan,
              loan: {
                data: {
                  ...purchaseOrderLoan.loan?.data,
                  origination_date: value ? value : new Date().getUTCDate(),
                },
              },
            });
          }}
        />
        <Typography variant="body2" color="textSecondary">
          The Payment Date is the date when the payment will arrive to the
          vendor and when interest charges begin.
        </Typography>
      </Box>
      <Box mt={3}>
        <FormControl fullWidth className={classes.purchaseOrderInput}>
          <CurrencyTextField
            label="Amount"
            currencySymbol="$"
            outputFormat="string"
            textAlign="left"
            value={purchaseOrderLoan.loan?.data?.amount}
            onChange={(_event: any, value: string) => {
              setPurchaseOrderLoan({
                ...purchaseOrderLoan,
                loan: {
                  data: {
                    ...purchaseOrderLoan.loan?.data,
                    amount: value,
                  },
                },
              });
            }}
          ></CurrencyTextField>
        </FormControl>
      </Box>
    </Box>
  );
}

export default PurchaseOrderLoanForm;

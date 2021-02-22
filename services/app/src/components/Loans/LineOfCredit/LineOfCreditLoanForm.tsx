import {
  Box,
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography,
} from "@material-ui/core";
import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import DatePicker from "components/Shared/Dates/DatePicker";
import {
  CompanyVendorPartnerships,
  LineOfCreditsInsertInput,
  LoansInsertInput,
  Vendors,
} from "generated/graphql";
import { ChangeEvent } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    purchaseOrderInput: {
      width: "200px",
    },
  })
);

type VendorsByPartnerCompanyType = Pick<Vendors, "id"> & {
  company_vendor_partnerships: Pick<
    CompanyVendorPartnerships,
    "id" | "approved_at"
  >[];
} & Pick<Vendors, "id" | "name">;

interface Props {
  lineOfCredit: LineOfCreditsInsertInput;
  loan: LoansInsertInput;
  selectableVendors: VendorsByPartnerCompanyType[];
  setLineOfCredit: (lineOfCredit: LineOfCreditsInsertInput) => void;
  setLoan: (loan: LoansInsertInput) => void;
}

function LineOfCreditLoanForm({
  lineOfCredit,
  loan,
  selectableVendors,
  setLineOfCredit,
  setLoan,
}: Props) {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column">
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!lineOfCredit.is_credit_for_vendor}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setLineOfCredit({
                  ...lineOfCredit,
                  is_credit_for_vendor: event.target.checked,
                });
              }}
              color="primary"
            />
          }
          label={"Loan is for a vendor"}
        />
      </Box>
      {lineOfCredit.is_credit_for_vendor && (
        <Box display="flex" flexDirection="row" mt={3}>
          <FormControl className={classes.purchaseOrderInput}>
            <InputLabel id="recipient-vendor-select-label">
              Recipient Vendor
            </InputLabel>
            <Select
              disabled={selectableVendors.length <= 0}
              labelId="recipient-vendor-select-label"
              id="recipient-vendor-select"
              value={lineOfCredit.recipient_vendor_id}
              onChange={({ target: { value } }) => {
                const selectedVendor = selectableVendors?.find(
                  (selectableVendor) => selectableVendor.id === value
                );
                setLineOfCredit({
                  ...lineOfCredit,
                  recipient_vendor_id: selectedVendor?.id,
                });
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {selectableVendors?.map((vendor) => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={2}>
        <DatePicker
          className={classes.purchaseOrderInput}
          id="requested-payment-date-date-picker"
          label="Payment Date"
          disablePast
          disableNonBankDays
          value={loan.requested_payment_date}
          onChange={(value) => {
            setLoan({
              ...loan,
              requested_payment_date: value,
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
            value={loan.amount}
            onChange={(_event: any, value: string) => {
              setLoan({
                ...loan,
                amount: value,
              });
            }}
          />
        </FormControl>
      </Box>
    </Box>
  );
}

export default LineOfCreditLoanForm;

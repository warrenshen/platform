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
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import {
  ApprovedVendorsByPartnerCompanyIdQuery,
  LineOfCreditsInsertInput,
  LoansInsertInput,
} from "generated/graphql";
import { ChangeEvent } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  lineOfCredit: LineOfCreditsInsertInput;
  loan: LoansInsertInput;
  selectableVendors: ApprovedVendorsByPartnerCompanyIdQuery["vendors"];
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
          <FormControl className={classes.inputField}>
            <InputLabel id="recipient-vendor-select-label">
              Recipient Vendor
            </InputLabel>
            <Select
              disabled={selectableVendors.length <= 0}
              labelId="recipient-vendor-select-label"
              id="recipient-vendor-select"
              value={lineOfCredit.recipient_vendor_id || ""}
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
          className={classes.inputField}
          id="requested-payment-date-date-picker"
          label="Requested Payment Date"
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
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            This is the date you want the recipient to receive financing. Given
            enough advance notice, Bespoke Financial will adhere to this
            request.
          </Typography>
        </Box>
      </Box>
      <Box mt={3}>
        <FormControl className={classes.inputField}>
          <CurrencyInput
            label={"Amount"}
            value={loan.amount}
            handleChange={(value) => {
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

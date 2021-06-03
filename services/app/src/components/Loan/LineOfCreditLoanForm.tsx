import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  GetArtifactRelationsByCompanyIdQuery,
  LineOfCreditsInsertInput,
  LoansInsertInput,
} from "generated/graphql";
import { ChangeEvent } from "react";

interface Props {
  lineOfCredit: LineOfCreditsInsertInput;
  loan: LoansInsertInput;
  vendors: GetArtifactRelationsByCompanyIdQuery["vendors"];
  setLineOfCredit: (lineOfCredit: LineOfCreditsInsertInput) => void;
  setLoan: (loan: LoansInsertInput) => void;
}

export default function LineOfCreditLoanForm({
  lineOfCredit,
  loan,
  vendors,
  setLineOfCredit,
  setLoan,
}: Props) {
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
        <Box display="flex" flexDirection="column" mt={4}>
          <FormControl>
            <InputLabel id="recipient-vendor-select-label">
              Recipient Vendor
            </InputLabel>
            <Select
              disabled={vendors.length <= 0}
              labelId="recipient-vendor-select-label"
              id="recipient-vendor-select"
              value={
                vendors.length > 0 ? lineOfCredit.recipient_vendor_id || "" : ""
              }
              onChange={({ target: { value } }) =>
                setLineOfCredit({
                  ...lineOfCredit,
                  recipient_vendor_id: value || null,
                })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {vendors.map((vendor) => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {`${vendor.name} ${
                    vendor.company_vendor_partnerships[0]?.approved_at
                      ? "(Approved)"
                      : "(Not approved)"
                  }`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
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
            {`This is the date you want ${
              lineOfCredit.is_credit_for_vendor ? "the vendor " : ""
            }to receive financing. Within
            banking limitations, Bespoke Financial will try to adhere to this
            request.`}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <FormControl>
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

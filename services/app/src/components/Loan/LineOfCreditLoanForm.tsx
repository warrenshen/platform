import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import AutocompleteVendors from "components/Vendors/AutocompleteVendors";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  GetArtifactRelationsByCompanyIdQuery,
  LineOfCreditsInsertInput,
  LoansInsertInput,
  Vendors,
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
  const selectedVendor = vendors.find(
    (v) => v.id === lineOfCredit.recipient_vendor_id
  ) as Vendors;

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
                  recipient_vendor_id: null,
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
          <AutocompleteVendors
            selectableVendors={vendors}
            selectedVendor={selectedVendor}
            onChange={(event, newValue) => {
              setLineOfCredit({
                ...lineOfCredit,
                recipient_vendor_id:
                  newValue?.company_vendor_partnerships[0]?.vendor_id || null,
              });
            }}
            dataCy={"line-of-credit-loan-form-autocomplete-vendors"}
            label={"Recipient Vendor"}
          />
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
      <Box display="flex" flexDirection="column" mt={4}>
        <TextField
          multiline
          label={"Comments"}
          helperText={"Any comments about this financing request"}
          value={lineOfCredit.customer_note || ""}
          onChange={({ target: { value } }) =>
            setLineOfCredit({
              ...lineOfCredit,
              customer_note: value,
            })
          }
        />
      </Box>
    </Box>
  );
}

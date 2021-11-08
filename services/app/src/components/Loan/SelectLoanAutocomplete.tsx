import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import LoanPaymentStatusChip from "components/Shared/Chip/LoanPaymentStatusChip";
import {
  LoanArtifactLimitedFragment,
  LoanLimitedFragment,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { LoanPaymentStatusEnum } from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
  getLoanArtifactName,
  getLoanVendorName,
} from "lib/loans";
import { ColumnWidths } from "lib/tables";
import { useState } from "react";

interface Props {
  isDisbursementIdentifierVisible?: boolean;
  optionLoans: (LoanLimitedFragment & LoanArtifactLimitedFragment)[];
  handleSelectLoan: (
    loan: LoanLimitedFragment & LoanArtifactLimitedFragment
  ) => void;
}

export default function SelectLoanAutocomplete({
  isDisbursementIdentifierVisible = false,
  optionLoans,
  handleSelectLoan,
}: Props) {
  const [autocompleteInputValue, setAutocompleteInputValue] = useState("");

  return (
    <FormControl>
      <Autocomplete
        autoHighlight
        id="combo-box-demo"
        options={optionLoans}
        inputValue={autocompleteInputValue}
        value={null}
        getOptionLabel={(loan) => {
          const artifactName = getLoanArtifactName(loan);
          const vendorName = getLoanVendorName(loan);
          return `${createLoanCustomerIdentifier(
            loan
          )} ${createLoanDisbursementIdentifier(loan)} ${formatCurrency(
            loan.amount
          )} ${artifactName} ${vendorName} ${formatDateString(
            loan.origination_date
          )} ${formatDateString(loan.adjusted_maturity_date)}`;
        }}
        renderInput={(params) => (
          <TextField {...params} label="Add another loan" variant="outlined" />
        )}
        renderOption={(loan) => {
          const artifactName = getLoanArtifactName(loan);
          const vendorName = getLoanVendorName(loan);
          return (
            <Box display="flex" py={0.5}>
              <Box display="flex" justifyContent="space-between">
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.Identifier}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <strong>Loan</strong>
                  </Typography>
                  <Typography variant="body2">
                    {createLoanCustomerIdentifier(loan)}
                  </Typography>
                  {isDisbursementIdentifierVisible && (
                    <Typography variant="body2">
                      {createLoanDisbursementIdentifier(loan)}
                    </Typography>
                  )}
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.Status}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <strong>Repayment Status</strong>
                  </Typography>
                  <LoanPaymentStatusChip
                    paymentStatus={loan.payment_status as LoanPaymentStatusEnum}
                  />
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.Currency}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <strong>Amount</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(loan.amount)}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.MinWidth}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <strong>PO / Invoice</strong>
                  </Typography>
                  <Typography variant="body2">{artifactName}</Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.MinWidth}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <strong>Vendor</strong>
                  </Typography>
                  <Typography variant="body2">{vendorName}</Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.Date}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <strong>Origination Date</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formatDateString(loan.origination_date)}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.Date}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <strong>Maturity Date</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formatDateString(loan.adjusted_maturity_date)}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.Currency}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <strong>Outstanding Principal</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(loan.outstanding_principal_balance)}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.Currency}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <strong>Outstanding Interest</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(loan.outstanding_interest)}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.Currency}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <strong>Outstanding Late Fees</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(loan.outstanding_fees)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        }}
        onChange={(_event, loan) => {
          if (loan) {
            handleSelectLoan(loan);
            setAutocompleteInputValue("");
          }
        }}
        onInputChange={(_event, value) => setAutocompleteInputValue(value)}
      />
    </FormControl>
  );
}

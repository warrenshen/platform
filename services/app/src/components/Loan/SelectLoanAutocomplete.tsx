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
          const artifactName = loan.purchase_order
            ? loan.purchase_order.order_number
            : loan.invoice
            ? loan.invoice.invoice_number
            : "N/A";
          const vendorName = loan.purchase_order
            ? loan.purchase_order.vendor?.name
            : loan.line_of_credit
            ? loan.line_of_credit.recipient_vendor?.name
            : "N/A";
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
          const artifactName = loan.purchase_order
            ? loan.purchase_order.order_number
            : loan.invoice
            ? loan.invoice.invoice_number
            : "N/A";
          const vendorName = loan.purchase_order
            ? loan.purchase_order.vendor?.name
            : loan.line_of_credit
            ? loan.line_of_credit.recipient_vendor?.name
            : "N/A";
          return (
            <Box display="flex" py={0.5}>
              <Box display="flex" justifyContent="space-between">
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.Identifier}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <b>Loan</b>
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
                    <b>Repayment Status</b>
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
                    <b>Amount</b>
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
                    <b>PO / Invoice</b>
                  </Typography>
                  <Typography variant="body2">{artifactName}</Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.MinWidth}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <b>Vendor</b>
                  </Typography>
                  <Typography variant="body2">{vendorName}</Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  width={ColumnWidths.Date}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    <b>Origination Date</b>
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
                    <b>Maturity Date</b>
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
                    <b>Outstanding Principal</b>
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
                    <b>Outstanding Interest</b>
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
                    <b>Outstanding Late Fees</b>
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

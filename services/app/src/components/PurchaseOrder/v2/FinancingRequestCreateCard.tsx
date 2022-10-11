import {
  Box,
  CardContent,
  FormControl,
  TextField,
  Typography,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import { LoansInsertInput } from "generated/graphql";
import { DateInputIcon } from "icons/index";
import { formatCurrency } from "lib/number";
import { useState } from "react";
import styled from "styled-components";

interface Props {
  isEditingExisting?: boolean;
  amountLeft: number;
  loan: LoansInsertInput;
  hasBeenFocused: boolean;
  hasEdited: boolean;
  setLoan: (loan: LoansInsertInput) => void;
  setHasEdited: (hasEdited: boolean) => void;
}

const FinancingRequestCard = styled.div`
  background-color: #f6f5f3;
  padding: 16px;
`;

const DateInputErrorText = styled.span`
  color: #f44336;
  font-size: 12px;
  margin-top: 2px;
`;

export default function FinancingRequestCreateCard({
  amountLeft,
  loan,
  hasBeenFocused,
  hasEdited,
  setLoan,
  setHasEdited,
}: Props) {
  const [hasDateBeenFocusedOnce, setHasDateBeenFocusedOnce] =
    useState<boolean>(hasBeenFocused);
  const [hasAmountBeenFocusedOnce, setHasAmountBeenFocusedOnce] =
    useState<boolean>(hasBeenFocused);

  let amountError;
  if (!!loan.amount && loan.amount > amountLeft) {
    amountError = `Please lower your financing request to be within the ${formatCurrency(
      amountLeft
    )} limit`;
  } else if (hasAmountBeenFocusedOnce && !loan.amount) {
    amountError = "Please enter amount for your financing request";
  }

  return (
    <FinancingRequestCard>
      <CardContent>
        <FormControl fullWidth>
          <DateInput
            dataCy={"requested-payment-date-date-picker"}
            id="requested-payment-date-date-picker"
            label="Requested Payment Date"
            disablePast
            disableNonBankDays
            value={loan.requested_payment_date}
            error={hasDateBeenFocusedOnce && !loan.requested_payment_date}
            onBlur={() => setHasDateBeenFocusedOnce(true)}
            onChange={(value) => {
              if (!hasEdited) {
                setHasEdited(true);
              }
              setLoan({
                ...loan,
                requested_payment_date: value,
              });
            }}
            keyboardIcon={<DateInputIcon width="16px" height="16px" />}
          />
          {hasDateBeenFocusedOnce && !loan.requested_payment_date && (
            <DateInputErrorText>
              Please enter the requested payment date
            </DateInputErrorText>
          )}
        </FormControl>
        <Box mt={2} mb={4}>
          <Typography variant="body1" color="textSecondary">
            This is the date you want the vendor to receive financing. Within
            banking limitations, Bespoke Financial will try to adhere to this
            request.
          </Typography>
        </Box>
        <FormControl fullWidth>
          <CurrencyInput
            dataCy={"financing-request-amount-input"}
            label={"Amount ($)"}
            value={loan.amount}
            onBlur={() => setHasAmountBeenFocusedOnce(true)}
            error={amountError}
            handleChange={(value) => {
              if (!hasEdited) {
                setHasEdited(true);
              }
              setLoan({
                ...loan,
                amount: value,
              });
            }}
          />
        </FormControl>
        <Box mt={4} />
        <FormControl fullWidth>
          <TextField
            label={"Comments"}
            value={loan.customer_notes}
            onChange={({ target: { value } }) => {
              if (!hasEdited) {
                setHasEdited(true);
              }
              setLoan({
                ...loan,
                customer_notes: value,
                notes: value,
              });
            }}
          />
        </FormControl>
      </CardContent>
    </FinancingRequestCard>
  );
}

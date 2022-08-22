import {
  Box,
  Card,
  CardContent,
  FormControl,
  Typography,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import { LoansInsertInput } from "generated/graphql";
import { DateInputIcon } from "icons/index";
import styled from "styled-components";

const testLoan = {
  artifact_id: "1ec775b0-8a41-442f-98d7-83ef9b65db22",
  loan_type: "purchase_order",
  requested_payment_date: null,
  amount: 1000,
  status: "drafted",
};
interface Props {
  loan: LoansInsertInput;
  setLoan: (loan: LoansInsertInput) => void;
}

const FinancingRequestCard = styled(Card)`
  background-color: #f6f5f3;
  padding: 16px;
`;

export default function FinancingRequestCreateCard({ loan, setLoan }: Props) {
  return (
    <FinancingRequestCard>
      <CardContent>
        <FormControl fullWidth>
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
            keyboardIcon={<DateInputIcon />}
          />
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
            label={"Amount ($)"}
            value={loan?.amount}
            handleChange={(value) =>
              setLoan({
                ...loan,
                amount: value,
              })
            }
          />
        </FormControl>
      </CardContent>
    </FinancingRequestCard>
  );
}

import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import {
  FinancialSummaryFragment,
  PaymentsInsertInput,
} from "generated/graphql";
import { formatCurrency } from "lib/number";
import { todayAsDateStringClient } from "lib/date";
import { ChangeEvent, useState, Dispatch, SetStateAction } from "react";

interface Props {
  financialSummary: FinancialSummaryFragment | null;
  payment: PaymentsInsertInput;
  setPayment: (payment: PaymentsInsertInput) => void;
  isPayAccountFeesVisible: boolean;
  setIsPayAccountFeesVisible: Dispatch<SetStateAction<boolean>>;
  accountFeeTotal: number;
}

export default function CreateRepaymentLineofCreditSection({
  financialSummary,
  payment,
  setPayment,
  isPayAccountFeesVisible,
  setIsPayAccountFeesVisible,
  accountFeeTotal,
}: Props) {
  const [isInterestVisible, setIsInterestVisible] = useState(false);

  return (
    <>
      <Box display="flex" flexDirection="column">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Typography variant="body1">
            {`As of today, ${todayAsDateStringClient()}...`}
          </Typography>
        </Box>
        <Box display="flex" mt={2}>
          <Box display="flex" flexDirection="column">
            <Typography variant="body2">Outstanding Principal</Typography>
            <Box mt={1}>
              <Typography variant="h5">
                {financialSummary
                  ? formatCurrency(financialSummary.total_outstanding_principal)
                  : "Loading..."}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" ml={6}>
            <Typography variant="body2">Outstanding Interest</Typography>
            <Box mt={1}>
              <Typography variant="h5">
                {financialSummary
                  ? formatCurrency(financialSummary.total_outstanding_interest)
                  : "Loading..."}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box my={6}>
        <Divider light />
      </Box>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body1">Specify payment amount</Typography>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPayAccountFeesVisible}
                  onChange={(_: ChangeEvent<HTMLInputElement>) =>
                    setIsPayAccountFeesVisible(!isPayAccountFeesVisible)
                  }
                  color="primary"
                />
              }
              label={"Pay account fees"}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isInterestVisible}
                  onChange={(_: ChangeEvent<HTMLInputElement>) =>
                    setIsInterestVisible(!isInterestVisible)
                  }
                  color="primary"
                />
              }
              label={"Pay interest"}
            />
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="subtitle2">
            How much of your outstanding principal do you want to pay for?
          </Typography>
          <Box display="flex" flexDirection="column" mt={1}>
            <FormControl>
              <CurrencyInput
                label={"Payment Amount to Principal"}
                value={payment.items_covered.requested_to_principal}
                handleChange={(value) => {
                  setPayment({
                    ...payment,
                    requested_amount:
                      (value || 0.0) +
                      (payment.items_covered.requested_to_interest || 0.0) +
                      (payment.items_covered.requested_to_account_fees || 0.0),
                    items_covered: {
                      ...payment.items_covered,
                      requested_to_principal: value,
                    },
                  });
                }}
              />
            </FormControl>
          </Box>
        </Box>
        {isInterestVisible && (
          <Box mt={4}>
            <Typography variant="subtitle2">
              How much of your outstanding interest do you want to pay for?
            </Typography>
            <Box display="flex" flexDirection="column" mt={1}>
              <FormControl>
                <CurrencyInput
                  label={"Payment Amount to Interest"}
                  value={payment.items_covered.requested_to_interest}
                  handleChange={(value) => {
                    setPayment({
                      ...payment,
                      requested_amount:
                        (value || 0.0) +
                        (payment.items_covered.requested_to_principal || 0.0) +
                        (payment.items_covered.requested_to_account_fees ||
                          0.0),
                      items_covered: {
                        ...payment.items_covered,
                        requested_to_interest: value,
                      },
                    });
                  }}
                />
              </FormControl>
            </Box>
          </Box>
        )}
        {isPayAccountFeesVisible ? (
          <Box my={6}>
            <Typography variant="body2">
              How much of your outstanding acount fees (
              {formatCurrency(accountFeeTotal)}) would you like to pay for?
            </Typography>
            <Box display="flex" flexDirection="column" mt={1}>
              <FormControl>
                <CurrencyInput
                  label={"Payment Amount to Account Fees"}
                  value={payment.items_covered["requested_to_account_fees"]}
                  handleChange={(value) => {
                    setPayment({
                      ...payment,
                      requested_amount:
                        (value || 0.0) +
                        (payment.items_covered.requested_to_principal || 0.0) +
                        (payment.items_covered.requested_to_interest || 0.0),
                      items_covered: {
                        ...payment.items_covered,
                        requested_to_account_fees: value,
                      },
                    });
                  }}
                />
              </FormControl>
            </Box>
          </Box>
        ) : (
          <></>
        )}
      </Box>
    </>
  );
}

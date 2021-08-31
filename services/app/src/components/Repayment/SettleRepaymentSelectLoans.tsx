import {
  Box,
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import RequestedRepaymentPreview from "components/Repayment/RequestedRepaymentPreview";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  PayorFragment,
  Companies,
  Loans,
  LoanTypeEnum,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetFundedLoansByCompanyAndLoanTypeQuery,
} from "generated/graphql";
import { ProductTypeToLoanType } from "lib/enum";
import { useMemo } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  isAmountToAccountFeesChecked: boolean;
  isAmountToLoansChecked: boolean;
  shouldPayPrincipalFirst: boolean;
  payment: PaymentsInsertInput;
  customer: Companies;
  payor: PayorFragment;
  setIsAmountToAccountFeesChecked: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  setIsAmountToLoansChecked: React.Dispatch<React.SetStateAction<boolean>>;
  setPayment: React.Dispatch<React.SetStateAction<PaymentsInsertInput>>;
  setShouldPayPrincipalFirst: (shouldPayPrincipalFirst: boolean) => void;
}

export default function SettleRepaymentSelectLoans({
  isAmountToAccountFeesChecked,
  isAmountToLoansChecked,
  shouldPayPrincipalFirst,
  payment,
  customer,
  payor,
  setIsAmountToAccountFeesChecked,
  setIsAmountToLoansChecked,
  setPayment,
  setShouldPayPrincipalFirst,
}: Props) {
  const classes = useStyles();
  const productType = customer.contract?.product_type;

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, error } = useGetFundedLoansByCompanyAndLoanTypeQuery({
    skip: !payment || !loanType,
    fetchPolicy: "network-only",
    variables: {
      companyId: payment.company_id,
      loanType: loanType || LoanTypeEnum.PurchaseOrder,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const selectedLoans = useMemo(
    () =>
      data?.loans.filter(
        (loan) => payment.items_covered.loan_ids.indexOf(loan.id) >= 0
      ) || [],
    [data?.loans, payment.items_covered.loan_ids]
  );

  const notSelectedLoans = useMemo(
    () =>
      data?.loans.filter(
        (loan) =>
          !loan.closed_at &&
          !!loan.origination_date &&
          payment.items_covered.loan_ids.indexOf(loan.id) < 0
      ) || [],
    [data?.loans, payment.items_covered.loan_ids]
  );

  const selectedLoansActionItems = useMemo(
    () => [
      {
        key: "deselect-loan",
        label: "Remove",
        handleClick: (params: ValueFormatterParams) =>
          setPayment((payment) => ({
            ...payment,
            items_covered: {
              ...payment.items_covered,
              loan_ids: payment.items_covered.loan_ids.filter(
                (loanId: Loans["id"]) => loanId !== params.row.data.id
              ),
            },
          })),
      },
    ],
    [setPayment]
  );

  const notSelectedLoansActionItems = useMemo(
    () => [
      {
        key: "select-loan",
        label: "Add",
        handleClick: (params: ValueFormatterParams) =>
          setPayment((payment) => ({
            ...payment,
            items_covered: {
              ...payment.items_covered,
              loan_ids: [
                ...payment.items_covered.loan_ids,
                params.row.data.id as Loans["id"],
              ],
            },
          })),
      },
    ],
    [setPayment]
  );

  if (!payment || !customer || !payor) {
    return null;
  }

  return (
    <Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="body1">
          {`${payor.name} submitted the following payment:`}
        </Typography>
        <Box mt={1}>
          <RequestedRepaymentPreview payment={payment} />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={1}>
          <Typography variant="body1">
            Specify actual total amount of this payment.
          </Typography>
        </Box>
        <FormControl className={classes.inputField}>
          <CurrencyInput
            label={"Total Amount"}
            value={payment.amount}
            handleChange={(value) => setPayment({ ...payment, amount: value })}
          />
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={1}>
          <Typography variant="body1">
            Specify Deposit Date and Settlement Date.
          </Typography>
        </Box>
        <DateInput
          className={classes.inputField}
          id="payment-date-date-picker"
          label="Deposit Date"
          disableNonBankDays
          value={payment.deposit_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              deposit_date: value,
            })
          }
        />
        {payment.deposit_date !== payment.requested_payment_date && (
          <Box mt={1}>
            <Typography variant="body2" color="secondary">
              Warning: you have selected a deposit date that is NOT the
              requested deposit / withdraw date. This is a valid selection but
              please double check that you intended to do this.
            </Typography>
          </Box>
        )}
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Deposit Date is the date the payment arrived to a Bespoke bank
            account.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          className={classes.inputField}
          id="settlement-date-date-picker"
          label="Settlement Date"
          disableNonBankDays
          value={payment.settlement_date}
          onChange={(value) =>
            setPayment({
              ...payment,
              settlement_date: value,
            })
          }
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Settlement Date is the date the payment is applied to loans. It is
            based off of Deposit Date and Clearance Days.
          </Typography>
        </Box>
      </Box>
      {isAmountToLoansChecked && productType !== ProductTypeEnum.LineOfCredit && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Box mb={1}>
            <Typography variant="body1">
              Select loans to apply this payment towards.
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {`If ${customer.name} selected loans during "Create Repayment", those loan will be pre-selected below.`}
            </Typography>
          </Box>
          <Box mt={2}>
            <Typography variant="subtitle1" color="textSecondary">
              <b>Selected loans</b>
            </Typography>
            <LoansDataGrid
              isArtifactVisible
              isDaysPastDueVisible
              isDisbursementIdentifierVisible
              isExcelExport={false}
              isMaturityVisible
              isSortingDisabled
              pager={false}
              loans={selectedLoans}
              actionItems={selectedLoansActionItems}
            />
          </Box>
          <Box mt={4}>
            <Typography variant="subtitle1" color="textSecondary">
              <b>Not selected loans</b>
            </Typography>
            <LoansDataGrid
              isArtifactVisible
              isDaysPastDueVisible
              isDisbursementIdentifierVisible
              isExcelExport={false}
              isMaturityVisible
              isSortingDisabled
              pageSize={25}
              loans={notSelectedLoans}
              actionItems={notSelectedLoansActionItems}
            />
          </Box>
        </Box>
      )}
      {isAmountToAccountFeesChecked && (
        <Box display="flex" flexDirection="column" mt={4}>
          <Box mb={1}>
            <Typography variant="body1">
              Select how much of payment to apply to account-level fees.
            </Typography>
          </Box>
          <FormControl className={classes.inputField}>
            <CurrencyInput
              label={"Amount To Account Fees"}
              value={payment.items_covered.to_account_fees}
              handleChange={(value) =>
                setPayment({
                  ...payment,
                  items_covered: {
                    ...payment.items_covered,
                    to_account_fees: value,
                  },
                })
              }
            />
          </FormControl>
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={1}>
          <Typography variant="body1">Advanced settings</Typography>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAmountToLoansChecked}
              onChange={(event) =>
                setIsAmountToLoansChecked(event.target.checked)
              }
              color="primary"
            />
          }
          label={"Apply portion of payment to loan(s)?"}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isAmountToAccountFeesChecked}
              onChange={(event) =>
                setIsAmountToAccountFeesChecked(event.target.checked)
              }
              color="primary"
            />
          }
          label={"Apply portion of payment to account-level fees?"}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={shouldPayPrincipalFirst}
              onChange={(event) =>
                setShouldPayPrincipalFirst(event.target.checked)
              }
              color="primary"
            />
          }
          label={
            "Apply payment in the following non-standard order: principal, interest, fees?"
          }
        />
      </Box>
    </Box>
  );
}

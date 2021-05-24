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
  BankPayorFragment,
  Companies,
  Loans,
  LoanTypeEnum,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetLoansByCompanyAndLoanTypeQuery,
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
  shouldPayPrincipalFirst: boolean;
  payment: PaymentsInsertInput;
  customer: Companies;
  payor: BankPayorFragment;
  setPayment: React.Dispatch<React.SetStateAction<PaymentsInsertInput>>;
  setShouldPayPrincipalFirst: (shouldPayPrincipalFirst: boolean) => void;
}

function SettleRepaymentSelectLoans({
  shouldPayPrincipalFirst,
  payment,
  customer,
  payor,
  setPayment,
  setShouldPayPrincipalFirst,
}: Props) {
  const classes = useStyles();
  const productType = customer.contract?.product_type;

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data } = useGetLoansByCompanyAndLoanTypeQuery({
    skip: !payment || !loanType,
    fetchPolicy: "network-only",
    variables: {
      companyId: payment.company_id,
      loanType: loanType || LoanTypeEnum.PurchaseOrder,
    },
  });

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

  return payment && customer && payor ? (
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
        <Box display="flex" flexDirection="column">
          <Box mb={1}>
            <Typography variant="subtitle2">
              Specify actual amount of this payment.
            </Typography>
          </Box>
          <FormControl className={classes.inputField}>
            <CurrencyInput
              label={"Amount"}
              value={payment.amount}
              handleChange={(value) =>
                setPayment({ ...payment, amount: value })
              }
            />
          </FormControl>
        </Box>
        <Box mt={4} mb={1}>
          <Typography variant="subtitle2">
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
      {productType !== ProductTypeEnum.LineOfCredit && (
        <>
          <Box display="flex" flexDirection="column" mt={4}>
            <Box mb={1}>
              <Typography variant="subtitle2">
                {`Select which loans this payment will apply towards. The loans that ${customer.name} suggested are pre-selected, but the final selection is up to your discretion.`}
              </Typography>
            </Box>
            <Typography variant="subtitle1">Selected loans</Typography>
            <LoansDataGrid
              isArtifactVisible
              isDaysPastDueVisible
              isDisbursementIdentifierVisible
              isMaturityVisible
              isSortingDisabled
              pager={false}
              loans={selectedLoans}
              actionItems={selectedLoansActionItems}
            />
          </Box>
          <Box mt={4}>
            <Typography variant="subtitle1">Not selected loans</Typography>
            <LoansDataGrid
              isArtifactVisible
              isDaysPastDueVisible
              isDisbursementIdentifierVisible
              isMaturityVisible
              isSortingDisabled
              pageSize={25}
              loans={notSelectedLoans}
              actionItems={notSelectedLoansActionItems}
            />
          </Box>
        </>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="body1" color="textSecondary">
          Advanced settings
        </Typography>
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
  ) : null;
}

export default SettleRepaymentSelectLoans;

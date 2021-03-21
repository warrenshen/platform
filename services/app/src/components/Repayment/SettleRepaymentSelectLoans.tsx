import {
  Box,
  createStyles,
  FormControl,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import RequestedRepaymentPreview from "components/Repayment/RequestedRepaymentPreview";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  BankPayorFragment,
  Companies,
  GetLoansByLoanIdsQuery,
  LoanFragment,
  Loans,
  PaymentsInsertInput,
  ProductTypeEnum,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext, useMemo } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  payment: PaymentsInsertInput;
  customer: Companies;
  payor: BankPayorFragment;
  allLoans: LoanFragment[];
  selectedLoanIds: Loans["id"][];
  selectedLoans: GetLoansByLoanIdsQuery["loans"];
  setPayment: (payment: PaymentsInsertInput) => void;
  setSelectedLoanIds: (selectedLoanIds: Loans["id"][]) => void;
}
function SettleRepaymentSelectLoans({
  payment,
  customer,
  payor,
  allLoans,
  selectedLoanIds,
  selectedLoans,
  setPayment,
  setSelectedLoanIds,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const classes = useStyles();
  const productType = customer.contract?.product_type;

  const maturingOrPastDueLoans = useMemo(
    () =>
      (allLoans || []).filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const matureThreshold = new Date(
          new Date(Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000
        );
        const maturityDate = new Date(loan.maturity_date);
        return (
          matureThreshold > maturityDate || pastDueThreshold > maturityDate
        );
      }),
    [allLoans]
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
      <Box display="flex" flexDirection="column" mt={3}>
        <Box display="flex" flexDirection="column">
          <Box mb={1}>
            <Typography variant="subtitle2">
              Step 1: specify actual amount of this payment.
            </Typography>
          </Box>
          <FormControl className={classes.inputField}>
            <CurrencyInput
              label={"Amount"}
              value={payment.amount}
              handleChange={(value: number) => {
                setPayment({ ...payment, amount: value });
              }}
            />
          </FormControl>
        </Box>
        <Box mt={3} mb={1}>
          <Typography variant="subtitle2">
            Step 2: specify payment and settlement date (settlement date will
            change when payment date changes).
          </Typography>
        </Box>
        <DatePicker
          className={classes.inputField}
          id="payment-date-date-picker"
          label="Deposit Date"
          disableNonBankDays
          disabledBefore={payment.payment_date}
          value={payment.deposit_date}
          onChange={(value) => {
            setPayment({
              ...payment,
              deposit_date: value,
            });
          }}
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Deposit Date is the date the payment arrived to a Bespoke bank
            account.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <DatePicker
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
          <Box display="flex" flexDirection="column" mt={3}>
            <Box mb={1}>
              <Typography variant="subtitle2">
                {`Step 2: select loans this payment will apply towards. The loans that ${customer.name} suggested are pre-selected, but the final selection is up to your discretion.`}
              </Typography>
            </Box>
            <Typography variant="body1">Selected loans:</Typography>
            <LoansDataGrid
              isDaysPastDueVisible
              isMaturityVisible
              isSortingDisabled
              pager={false}
              loans={selectedLoans}
              actionItems={
                check(role, Action.DeselectLoan)
                  ? [
                      {
                        key: "deselect-loan",
                        label: "Remove",
                        handleClick: (params) =>
                          setSelectedLoanIds(
                            selectedLoanIds.filter(
                              (loanId) => loanId !== params.row.data.id
                            )
                          ),
                      },
                    ]
                  : []
              }
            />
          </Box>
          <Box mt={3}>
            <Typography variant="body1">
              Loans not selected, but past due or maturing in 7 days:
            </Typography>
            <LoansDataGrid
              isDaysPastDueVisible
              isMaturityVisible
              isSortingDisabled
              pageSize={5}
              loans={maturingOrPastDueLoans.filter(
                (loan) => !selectedLoanIds.includes(loan.id)
              )}
              actionItems={
                check(role, Action.SelectLoan)
                  ? [
                      {
                        key: "select-loan",
                        label: "Add",
                        handleClick: (params) =>
                          setSelectedLoanIds([
                            ...selectedLoanIds,
                            params.row.data.id as Loans["id"],
                          ]),
                      },
                    ]
                  : []
              }
            />
          </Box>
        </>
      )}
    </Box>
  ) : null;
}

export default SettleRepaymentSelectLoans;

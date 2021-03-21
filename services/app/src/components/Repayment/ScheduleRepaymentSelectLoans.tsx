import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import RequestedRepaymentPreview from "components/Repayment/RequestedRepaymentPreview";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  GetLoansByLoanIdsQuery,
  Loans,
  LoanTypeEnum,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetFundedLoansForCompanyQuery,
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
  selectedLoans: GetLoansByLoanIdsQuery["loans"];
  setPayment: (payment: PaymentsInsertInput) => void;
}
function ScheduleRepaymentSelectLoans({
  payment,
  customer,
  selectedLoans,
  setPayment,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const classes = useStyles();
  const productType = customer.contract?.product_type;
  const selectedLoanIds = selectedLoans.map((loan) => loan.id);

  // Only loans maturing in 14 days or past due are the ones that may want to be shuffled in.
  const { data } = useGetFundedLoansForCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId: customer.id,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });
  const maturingOrPastDueLoans = useMemo(
    () =>
      (data?.loans || []).filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const matureThreshold = new Date(
          new Date(Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000
        );
        const maturityDate = new Date(loan.maturity_date);
        return (
          matureThreshold > maturityDate || pastDueThreshold > maturityDate
        );
      }),
    [data?.loans]
  );

  return payment && customer ? (
    <Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="body1">
          {`${customer.name} submitted the following Reverse Draft ACH request:`}
        </Typography>
        <Box mt={1}>
          <RequestedRepaymentPreview payment={payment} />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <Box mb={1}>
          <Typography variant="subtitle2">
            When did or will you trigger the Reverse Draft ACH?
          </Typography>
        </Box>
        <DatePicker
          className={classes.inputField}
          id="payment-date-date-picker"
          label="Payment Date"
          disableNonBankDays
          disabledBefore={payment.requested_payment_date}
          value={payment.payment_date}
          onChange={(value) => {
            setPayment({
              ...payment,
              payment_date: value,
            });
          }}
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Payment Date is the date you initiated or will initiate the Reverse
            Draft ACH.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <DatePicker
          disabled
          className={classes.inputField}
          id="deposit-date-date-picker"
          label="Expected Deposit Date"
          value={payment.deposit_date}
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Expected Deposit Date is the date we expect the payment to arrive to
            a Bespoke bank account.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <DatePicker
          disabled
          className={classes.inputField}
          id="settlement-date-date-picker"
          label="Expected Settlement Date"
          value={payment.settlement_date}
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            Expected Settlement Date is the date we expect the payment to be
            applied to interest balance (deposit date plus Clearance Days).
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
                          setPayment({
                            ...payment,
                            items_covered: {
                              ...payment.items_covered,
                              loan_ids: selectedLoanIds.filter(
                                (loanId) => loanId !== params.row.data.id
                              ),
                            },
                          }),
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
                          setPayment({
                            ...payment,
                            items_covered: {
                              ...payment.items_covered,
                              loan_ids: [
                                ...selectedLoanIds,
                                params.row.data.id as Loans["id"],
                              ],
                            },
                          }),
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

export default ScheduleRepaymentSelectLoans;

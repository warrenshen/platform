import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import { Alert } from "@material-ui/lab";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import RequestedRepaymentPreview from "components/Repayment/RequestedRepaymentPreview";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  Companies,
  LoanTypeEnum,
  Loans,
  PaymentsInsertInput,
  PayorFragment,
  useGetClosedLimitedLoansByLoanIdsQuery,
  useGetOpenFundedLoansByCompanyAndLoanTypeQuery,
  useGetSurveillanceResultByCompanyIdQuery,
} from "generated/graphql";
import {
  ProductTypeEnum,
  ProductTypeToLoanType,
  SurveillanceStatusEnum,
  SurveillanceStatusToLabel,
} from "lib/enum";
import { surveillanceStatusToAlertStatus } from "pages/Bank/Company/BankCompanyPage";
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

  const { data: surveillanceResultData, error: surveillanceResultError } =
    useGetSurveillanceResultByCompanyIdQuery({
      fetchPolicy: "network-only",
      variables: {
        company_id: customer.id,
      },
    });

  if (surveillanceResultError) {
    console.error({ error: surveillanceResultError });
    alert(
      `Error in query (details in console): ${surveillanceResultError.message}`
    );
  }

  const surveillanceStatus = surveillanceResultData
    ?.customer_surveillance_results[0]
    ?.surveillance_status as SurveillanceStatusEnum;

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType as ProductTypeEnum]
      : null;

  const { data, error } = useGetOpenFundedLoansByCompanyAndLoanTypeQuery({
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

  const { data: closedLoansByIdData, error: closedLoansByIdError } =
    useGetClosedLimitedLoansByLoanIdsQuery({
      skip:
        !payment.items_covered?.loan_ids ||
        payment.items_covered.loan_ids.length === 0,
      fetchPolicy: "network-only",
      variables: {
        loan_ids: payment.items_covered.loan_ids,
      },
    });

  if (closedLoansByIdError) {
    console.error({ closedLoansByIdError });
    alert(
      `Error in query (details in console): ${closedLoansByIdError.message}`
    );
  }

  const closedLoansCoveredByPayment = useMemo(
    () => closedLoansByIdData?.loans || [],
    [closedLoansByIdData?.loans]
  );

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
        handleClick: (params: GridValueFormatterParams) =>
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
        handleClick: (params: GridValueFormatterParams) =>
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

  const renderSurveillanceStatus = () => {
    if (!surveillanceStatus) {
      return null;
    }
    const { severity } = surveillanceStatusToAlertStatus[surveillanceStatus];

    return (
      <Box display="flex" ml={2}>
        <Alert severity={severity}>
          <Typography>
            {SurveillanceStatusToLabel[surveillanceStatus]}
          </Typography>
        </Alert>
      </Box>
    );
  };

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
      <Box display="flex" alignItems="center" mt={2}>
        <Text textVariant={TextVariants.Paragraph} bottomMargin={0}>
          Surveillance Status:
        </Text>
        {!!surveillanceStatus && renderSurveillanceStatus()}
      </Box>
      <Box>
        <FormControl className={classes.inputField}>
          <TextField
            label="Bank Note"
            value={payment.bank_note || ""}
            onChange={({ target: { value } }) =>
              setPayment({ ...payment, bank_note: value })
            }
          />
        </FormControl>
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
            "Apply repayment to loans in the following non-standard order: principal, interest, fees?"
          }
        />
        {shouldPayPrincipalFirst && (
          <Text textVariant={TextVariants.Label} bottomMargin={0}>
            Because this payment is being applied to principal first, the system
            will automatically select the loans
          </Text>
        )}
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
      {isAmountToLoansChecked &&
        productType !== ProductTypeEnum.LineOfCredit &&
        !shouldPayPrincipalFirst && (
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
                <strong>Selected loans</strong>
              </Typography>
              <LoansDataGrid
                isArtifactVisible
                isDaysPastDueVisible
                isDisbursementIdentifierVisible
                isExcelExport={false}
                isMaturityVisible
                isSortingDisabled
                pager={false}
                loans={[...selectedLoans, ...closedLoansCoveredByPayment]}
                actionItems={selectedLoansActionItems}
              />
            </Box>
            <Box mt={4}>
              <Typography variant="subtitle1" color="textSecondary">
                <strong>Not selected loans</strong>
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
              onChange={(event) => {
                if (!event.target.checked) {
                  // Since user un-selected this checkbox, reset loan_ids.
                  setPayment({
                    ...payment,
                    items_covered: {
                      ...payment.items_covered,
                      loan_ids: [],
                    },
                  });
                }
                setIsAmountToLoansChecked(event.target.checked);
              }}
              color="primary"
            />
          }
          label={"Apply portion of repayment to loan(s)?"}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isAmountToAccountFeesChecked}
              onChange={(event) => {
                if (!event.target.checked) {
                  // Since user un-selected this checkbox, reset to_account_fees to 0.
                  setPayment({
                    ...payment,
                    items_covered: {
                      ...payment.items_covered,
                      to_account_fees: 0.0,
                    },
                  });
                }
                setIsAmountToAccountFeesChecked(event.target.checked);
              }}
              color="primary"
            />
          }
          label={"Apply portion of repayment to account-level fees?"}
        />
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            autoFocus
            multiline
            label={"Bank Note"}
            helperText={"Only Bespoke Financial users can view this note"}
            value={payment.bank_note}
            onChange={({ target: { value } }) =>
              setPayment({
                ...payment,
                bank_note: value,
              })
            }
          />
        </Box>
      </Box>
    </Box>
  );
}

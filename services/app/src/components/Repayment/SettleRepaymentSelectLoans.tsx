import { Box, Typography } from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import {
  Companies,
  GetLoansByLoanIdsQuery,
  Loans,
  LoanTypeEnum,
  PaymentsInsertInput,
  ProductTypeEnum,
  useGetOutstandingLoansForCustomerQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";

interface Props {
  payment: PaymentsInsertInput;
  customer: Companies;
  selectedLoanIds: Loans["id"][];
  selectedLoans: GetLoansByLoanIdsQuery["loans"];
  setSelectedLoanIds: (selectedLoanIds: Loans["id"][]) => void;
}
function SettleRepaymentSelectLoans({
  payment,
  customer,
  selectedLoanIds,
  selectedLoans,
  setSelectedLoanIds,
}: Props) {
  const productType = customer.contract?.product_type;

  // Only loans maturing in 14 days or past due are the ones that may want to be shuffled in.
  const { data } = useGetOutstandingLoansForCustomerQuery({
    variables: {
      companyId: customer.id,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });
  const outstandingLoans = data?.loans || [];

  return payment && customer ? (
    <Box>
      <Box>
        <Typography>
          {`${customer.name} submitted a ${
            PaymentMethodToLabel[payment.method as PaymentMethodEnum]
          } payment of ${formatCurrency(
            payment.amount
          )} with a requested payment date of ${formatDateString(
            payment.requested_payment_date
          )}.`}
        </Typography>
        <Typography>
          {`Please select which loans this payment should apply towards below.
            The loans that ${customer.name} wants to apply this payment towards
            are pre-selected for you, but the final selection is up to your
            discretion.`}
        </Typography>
        <Typography>
          Once you are finished, press "Next" at the bottom to proceed to the
          next step.
        </Typography>
      </Box>
      <Box mt={2}>
        <Typography>Selected loans this payment will apply towards:</Typography>
        <LoansDataGrid
          isSortingDisabled
          isStatusVisible={false}
          customerSearchQuery={""}
          loans={selectedLoans}
          actionItems={[
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
          ]}
        />
      </Box>
      <Box mt={2}>
        <Typography>Loans not included in the above selection:</Typography>
        <LoansDataGrid
          isSortingDisabled
          customerSearchQuery={""}
          loans={outstandingLoans.filter(
            (loan) => !selectedLoanIds.includes(loan.id)
          )}
          actionItems={[
            {
              key: "select-loan",
              label: "Add",
              handleClick: (params) =>
                setSelectedLoanIds([
                  ...selectedLoanIds,
                  params.row.data.id as Loans["id"],
                ]),
            },
          ]}
        />
      </Box>
    </Box>
  ) : null;
}

export default SettleRepaymentSelectLoans;

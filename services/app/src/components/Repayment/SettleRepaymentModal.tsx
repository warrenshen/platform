import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import {
  LoanTypeEnum,
  Payments,
  ProductTypeEnum,
  useGetLoansByLoanIdsQuery,
  useGetPaymentForSettlementQuery,
  useLoansByCompanyAndLoanTypeForBankQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";

interface Props {
  paymentId: Payments["id"];
  handleClose: () => void;
}

function SettleRepaymentModal({ paymentId, handleClose }: Props) {
  const { data: dataPayment } = useGetPaymentForSettlementQuery({
    variables: { id: paymentId },
  });

  const payment = dataPayment?.payments_by_pk;
  const customer = payment?.company;
  const productType = customer?.contract?.product_type;

  const selectedLoanIds = payment?.items_covered?.loan_ids || [];
  const { data: dataSelectedLoans } = useGetLoansByLoanIdsQuery({
    variables: {
      loanIds: payment?.items_covered?.loan_ids || [],
    },
  });
  const selectedLoans = dataSelectedLoans?.loans || [];

  const { data: dataLoansByCompany } = useLoansByCompanyAndLoanTypeForBankQuery(
    {
      variables: {
        companyId: customer ? customer.id : null,
        loanType:
          productType === ProductTypeEnum.LineOfCredit
            ? LoanTypeEnum.LineOfCredit
            : LoanTypeEnum.PurchaseOrder,
      },
    }
  );
  const loansByCompany = dataLoansByCompany?.loans || [];

  const handleClickNext = async () => {};

  return payment && customer ? (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <DialogTitle>Settle Payment</DialogTitle>
      <DialogContent>
        <Box>
          <Typography>
            {`${customer.name} submitted a ${
              PaymentMethodToLabel[payment.method as PaymentMethodEnum]
            } payment of ${formatCurrency(payment.amount)}.`}
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
          <Typography>
            Selected loans this payment will apply towards:
          </Typography>
          <LoansDataGrid
            isStatusVisible={false}
            loans={selectedLoans}
            customerSearchQuery={""}
          />
        </Box>
        <Box mt={2}>
          <Typography>Loans not included in the above selection:</Typography>
          <LoansDataGrid
            isStatusVisible={false}
            loans={loansByCompany.filter(
              (loan) => !selectedLoanIds.includes(loan.id)
            )}
            customerSearchQuery={""}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={false}
          variant="contained"
          color="primary"
          onClick={handleClickNext}
        >
          Next
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default SettleRepaymentModal;

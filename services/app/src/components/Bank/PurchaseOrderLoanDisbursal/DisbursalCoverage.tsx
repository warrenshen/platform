import { Box } from "@material-ui/core";
import {
  PurchaseOrderLoans,
  usePurchaseOrderLoanQuery,
} from "generated/graphql";

interface Props {
  amount: number;
  purchaseOrderLoanId: PurchaseOrderLoans["id"];
}

function DisbursalCoverage(props: Props) {
  const { data } = usePurchaseOrderLoanQuery({
    variables: {
      id: props.purchaseOrderLoanId,
    },
  });

  if (!data || !data.purchase_order_loans_by_pk) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box>Number selected: {props.amount}</Box>
      <Box>
        Covering {data.purchase_order_loans_by_pk.loan?.amount} for PO made
        towards {data.purchase_order_loans_by_pk.purchase_order.vendor?.name}
      </Box>
    </Box>
  );
}

export default DisbursalCoverage;

import { Box, Drawer, makeStyles, Typography } from "@material-ui/core";
import DisbursalButton from "components/Bank/PurchaseOrderLoanDisbursal/DisbursalButton";
import Disbursements from "components/Bank/PurchaseOrderLoanDisbursal/Disbursements";
import Can from "components/Shared/Can";
import PurchaseOrderInfoCard from "components/Shared/PurchaseOrder/PurchaseOrderInfoCard";
import {
  PurchaseOrderLoans,
  usePurchaseOrderLoanQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";

const useStyles = makeStyles({
  drawerContent: {
    width: 700,
  },
});

interface Props {
  loanId: PurchaseOrderLoans["id"];
  onClose: () => void;
}

function PurchaseOrderLoanDrawer(props: Props) {
  const classes = useStyles();
  const { data } = usePurchaseOrderLoanQuery({
    variables: {
      id: props.loanId,
    },
  });

  if (!data?.loans_by_pk) {
    return null;
  }

  const loan = data.loans_by_pk;

  return (
    <Drawer open anchor="right" onClose={props.onClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h6">Loan Details</Typography>
        <Typography variant="h6">Purchase Order</Typography>
        {loan.purchase_order && (
          <PurchaseOrderInfoCard
            purchaseOrder={loan.purchase_order}
          ></PurchaseOrderInfoCard>
        )}
        <Typography variant="h6">Payments</Typography>
        <Can perform={Action.DisbursePurchaseOrderLoans}>
          <DisbursalButton
            vendorId={loan.purchase_order?.vendor?.id}
            purchaseOrderLoanId={loan.id}
            initialAmount={loan.amount}
          ></DisbursalButton>
          <Disbursements id={loan.id}></Disbursements>
        </Can>
      </Box>
    </Drawer>
  );
}

export default PurchaseOrderLoanDrawer;

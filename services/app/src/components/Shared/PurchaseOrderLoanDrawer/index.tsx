import { Box, Drawer, makeStyles, Typography } from "@material-ui/core";
import DisbursalButton from "components/Bank/PurchaseOrderLoanDisbursal/DisbursalButton";
import Disbursements from "components/Bank/PurchaseOrderLoanDisbursal/Disbursements";
import Can from "components/Shared/Can";
import InfoCard from "components/Shared/PurchaseOrder/InfoCard";
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
  purchaseOrderLoanId: PurchaseOrderLoans["id"];
  onClose: () => void;
}

function PurchaseOrderLoanDrawer(props: Props) {
  const classes = useStyles();
  const { data } = usePurchaseOrderLoanQuery({
    variables: {
      id: props.purchaseOrderLoanId,
    },
  });

  if (!data || !data.purchase_order_loans_by_pk) {
    return null;
  }

  return (
    <Drawer open anchor="right" onClose={props.onClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h6">Loan Details</Typography>

        <Typography variant="h6">Purchase Order</Typography>
        <InfoCard
          purchaseOrder={data.purchase_order_loans_by_pk.purchase_order}
        ></InfoCard>
        <Typography variant="h6">Payments</Typography>
        <Can perform={Action.DisbursePurchaseOrderLoans}>
          <DisbursalButton
            vendorId={data.purchase_order_loans_by_pk.purchase_order.vendor?.id}
            purchaseOrderLoanId={data.purchase_order_loans_by_pk.id}
            initialAmount={data.purchase_order_loans_by_pk.amount}
          ></DisbursalButton>
          <Disbursements
            id={data.purchase_order_loans_by_pk.id}
          ></Disbursements>
        </Can>
      </Box>
    </Drawer>
  );
}

export default PurchaseOrderLoanDrawer;

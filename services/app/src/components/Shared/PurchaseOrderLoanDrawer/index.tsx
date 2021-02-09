import { Box, Drawer, makeStyles, Typography } from "@material-ui/core";
import PurchaseOrderInfoCard from "components/Shared/PurchaseOrder/PurchaseOrderInfoCard";
import {
  PurchaseOrderLoans,
  usePurchaseOrderLoanQuery,
} from "generated/graphql";

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
      </Box>
    </Drawer>
  );
}

export default PurchaseOrderLoanDrawer;

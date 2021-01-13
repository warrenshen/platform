import {
  Box,
  Drawer,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import DisbursalButton from "components/Bank/Disbursal/DisbursalButton";
import Can from "components/Can";
import InfoCard from "components/Shared/PurchaseOrder/InfoCard";
import {
  PurchaseOrderLoans,
  usePurchaseOrderLoanQuery,
} from "generated/graphql";
import { Action } from "lib/rbac-rules";
import { calendarDateTimestamp } from "lib/time";

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
          ></DisbursalButton>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Settled</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.purchase_order_loans_by_pk.disbursements.map(
                  (disbursement) => {
                    return (
                      <TableRow>
                        <TableCell>
                          $
                          {Intl.NumberFormat("en-US").format(
                            disbursement.amount
                          )}
                        </TableCell>
                        <TableCell>{disbursement.company?.name}</TableCell>
                        <TableCell>
                          {calendarDateTimestamp(disbursement.submitted_at)}
                        </TableCell>
                        <TableCell>
                          {calendarDateTimestamp(disbursement.settled_at)}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Can>
      </Box>
    </Drawer>
  );
}

export default PurchaseOrderLoanDrawer;

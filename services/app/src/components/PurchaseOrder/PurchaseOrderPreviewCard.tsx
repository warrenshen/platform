import {
  Box,
  Card,
  CardContent,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { PurchaseOrderLimitedFragment } from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { formatDateString } from "lib/date";
import { formatCurrency } from "lib/number";
import styled from "styled-components";

const useStyles = makeStyles({
  label: {
    width: 130,
    color: "#abaaa9",
  },
});

interface Props {
  isApprovedStatusVisible?: boolean;
  purchaseOrder: PurchaseOrderLimitedFragment;
}

const CardTitle = styled.div`
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  color: #2c2a27;
  margin-bottom: 16px;
`;

const ApprovedText = styled.div`
  font-size: 24px;
  font-weight: 600;
  line-height: 27px;
  color: #03a9f4;
  margin-bottom: 24px;
`;

export default function PurchaseOrderPreviewCard({
  isApprovedStatusVisible = true,
  purchaseOrder,
}: Props) {
  const classes = useStyles();

  return (
    <Box width="fit-content">
      <CardTitle>PO #{purchaseOrder.order_number}</CardTitle>
      <Card style={{ width: 520 }}>
        <CardContent style={{ padding: 32 }}>
          {isApprovedStatusVisible && (
            <Box display="flex" alignItems="center" pt={0.5} pb={1}>
              <ApprovedText>Approved</ApprovedText>
            </Box>
          )}
          <Box display="flex" pb={1} justifyContent="space-between">
            <Box className={classes.label}>Vendor</Box>
            <Box>{getCompanyDisplayName(purchaseOrder.vendor)}</Box>
          </Box>
          <Box display="flex" pb={1} justifyContent="space-between">
            <Box className={classes.label}>PO Number</Box>
            <Box>{purchaseOrder.order_number}</Box>
          </Box>
          <Box display="flex" pb={1} justifyContent="space-between">
            <Box className={classes.label}>PO Date</Box>
            <Box>{formatDateString(purchaseOrder.order_date)}</Box>
          </Box>
          <Box display="flex" pb={1} justifyContent="space-between">
            <Box className={classes.label}>Amount</Box>
            <Box>{formatCurrency(purchaseOrder.amount)}</Box>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Box className={classes.label}>Comments</Box>
            <Box>{purchaseOrder.customer_note || "-"}</Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

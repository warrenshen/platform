import { Box, Typography } from "@material-ui/core";
import FinancialRequestsDataGrid from "components/Loans/FinancingRequestsDataGrid";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import { PurchaseOrderFragment } from "generated/graphql";
import { partition } from "lodash";

interface Props {
  purchaseOrder: PurchaseOrderFragment;
}

const BankPurchaseOrderFinancingDrawerTab = ({ purchaseOrder }: Props) => {
  const [loans, financingRequests] = partition(
    (purchaseOrder as any).loans,
    (loan) => loan.funded_at !== null
  );

  return (
    <Box>
      <Box m={4} />
      <Typography variant="h6">Loans</Typography>
      <Box m={2} />
      <LoansDataGrid
        loans={loans}
        isDaysPastDueVisible={true}
        isStatusVisible={true}
        isMaturityVisible={true}
        isVendorVisible={false}
        showMaturingInOrDaysPastDue={false}
        pager={false}
      />
      <Box m={4} />
      <Typography variant="h6">Financing Requests</Typography>
      <Box m={2} />
      <FinancialRequestsDataGrid financingRequests={financingRequests} />
    </Box>
  );
};

export default BankPurchaseOrderFinancingDrawerTab;

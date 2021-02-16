import { Box, Typography } from "@material-ui/core";
import Page from "components/Shared/Page";
import PaymentsDataGrid from "components/Shared/Payments/PaymentsDataGrid";
import {
  useGetPaymentsQuery,
  useGetSubmittedPaymentsQuery,
} from "generated/graphql";

function BankPaymentsPage() {
  const { data } = useGetPaymentsQuery();
  const { data: submittedPaymentsData } = useGetSubmittedPaymentsQuery();

  const payments = data?.payments || [];
  const submittedPayments = submittedPaymentsData?.payments || [];

  return (
    <Page appBarTitle={"Payments"}>
      <Box>
        <Typography variant="h6">Payments - Action Required</Typography>
        <PaymentsDataGrid
          payments={submittedPayments}
          customerSearchQuery={""}
          onClickCustomerName={() => {}}
        />
      </Box>
      <Box>
        <Typography variant="h6">Payments - All</Typography>
        <PaymentsDataGrid
          payments={payments}
          customerSearchQuery={""}
          onClickCustomerName={() => {}}
        />
      </Box>
    </Page>
  );
}

export default BankPaymentsPage;

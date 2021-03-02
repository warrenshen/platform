import { Box } from "@material-ui/core";
import PaymentsDataGrid from "components/Repayment/PaymentsDataGrid";
import Page from "components/Shared/Page";
import { useGetPaymentsQuery } from "generated/graphql";

function BankPaymentsPage() {
  const { data } = useGetPaymentsQuery();

  const payments = data?.payments || [];

  return (
    <Page appBarTitle={"Payments - All"}>
      <Box>
        <PaymentsDataGrid
          payments={payments}
          customerSearchQuery={""}
          onClickCustomerName={() => {}}
          enableSelect={false}
        />
      </Box>
    </Page>
  );
}

export default BankPaymentsPage;

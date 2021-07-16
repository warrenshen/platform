import { Box } from "@material-ui/core";
import PaymentBlock from "components/Payment/PaymentBlock";
import RepaymentTransactionsDataGrid from "components/Payment/RepaymentTransactionsDataGrid";
import PageContent from "components/Shared/Page/PageContent";
import { Companies, useGetPaymentsForCompanyQuery } from "generated/graphql";
import { useMemo } from "react";

interface Props {
  companyId: Companies["id"];
}

export default function CustomerRepaymentsPageContent({ companyId }: Props) {
  const { data, error } = useGetPaymentsForCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;
  const payments = useMemo(() => company?.payments || [], [company]);

  // TODO(warrenshen): pagination is necessary for the list of PaymentBlocks rendered below.
  return (
    <PageContent
      title={"Repayments"}
      subtitle={"Review your historical repayments to Bespoke Financial."}
    >
      <Box mt={4}>
        <RepaymentTransactionsDataGrid payments={payments} />
      </Box>
      <Box mt={4}>
        {false &&
          payments.map((payment, index) => (
            <Box key={payment.id}>
              {index > 0 && <Box mt={8} />}
              <PaymentBlock payment={payment} />
            </Box>
          ))}
      </Box>
    </PageContent>
  );
}
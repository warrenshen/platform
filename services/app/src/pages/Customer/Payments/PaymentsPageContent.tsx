import { Box } from "@material-ui/core";
import PaymentBlock from "components/Payment/PaymentBlock";
import PageContent from "components/Shared/Page/PageContent";
import { useGetPaymentsForCompanyQuery } from "generated/graphql";
import { useMemo } from "react";

interface Props {
  companyId: string;
}

export default function CustomerPaymentsPageContent({ companyId }: Props) {
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
  const transactions = useMemo(
    () => payments.flatMap((payment) => payment.transactions),
    [payments]
  );
  console.log({ payments, transactions });

  return (
    <PageContent
      title={"Payments"}
      subtitle={"Review your historical payments to Bespoke Financial."}
    >
      <Box mt={4}>
        {payments.map((payment, index) => (
          <Box key={payment.id}>
            {index > 0 && <Box mt={8} />}
            <PaymentBlock payment={payment} />
          </Box>
        ))}
      </Box>
    </PageContent>
  );
}

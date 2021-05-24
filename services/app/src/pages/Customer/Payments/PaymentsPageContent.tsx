import { Box } from "@material-ui/core";
import PaymentBlock from "components/Payment/PaymentBlock";
import RepaymentTransactionsDataGrid from "components/Payment/RepaymentTransactionsDataGrid";
import PageContent from "components/Shared/Page/PageContent";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { useGetPaymentsForCompanyQuery } from "generated/graphql";
import { useContext, useMemo } from "react";

interface Props {
  companyId: string;
}

export default function CustomerPaymentsPageContent({ companyId }: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

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

  return (
    <PageContent
      title={"Payments"}
      subtitle={"Review your historical payments to Bespoke Financial."}
    >
      <Box mt={4}>
        <RepaymentTransactionsDataGrid
          isExcelExport={isBankUser}
          payments={payments}
        />
      </Box>
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

import { Box } from "@material-ui/core";
import CustomerRepaymentTransactionsDataGrid from "components/Payment/CustomerRepaymentTransactionsDataGrid";
import PageContent from "components/Shared/Page/PageContent";
import { Companies, useGetRepaymentsForCompanyQuery } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import { useMemo } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

export default function CustomerRepaymentsPageContent({
  companyId,
  productType,
}: Props) {
  const { data, error } = useGetRepaymentsForCompanyQuery({
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
      title={"Repayments"}
      subtitle={"Review your historical repayments to Bespoke Financial."}
    >
      <Box mt={4}>
        <CustomerRepaymentTransactionsDataGrid
          isLineOfCredit={productType === ProductTypeEnum.LineOfCredit}
          payments={payments}
        />
      </Box>
    </PageContent>
  );
}

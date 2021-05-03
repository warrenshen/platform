import { Box, Tab, Tabs, Typography } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import LinearProgressBar from "components/Shared/ProgressBar/LinearProgressBar";
import {
  ProductTypeEnum,
  useGetActiveLoansForCompanyQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { ProductTypeToLoanType } from "lib/enum";
import { round } from "lodash";
import CustomerLoansActiveTab from "pages/Customer/Loans/LoansActiveTab";
import CustomerLoansClosedTab from "pages/Customer/Loans/LoansClosedTab";
import { useState } from "react";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function CustomerLoansPageContent({ companyId, productType }: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, error } = useGetActiveLoansForCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
      loanType,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summaries[0] || null;

  const outstandingAmount = financialSummary
    ? financialSummary.adjusted_total_limit - financialSummary.available_limit
    : 0;
  const rawLimitPercent = financialSummary?.adjusted_total_limit
    ? (100 * outstandingAmount) / financialSummary.adjusted_total_limit
    : 100;
  const roundedLimitPercent = round(rawLimitPercent, 1);

  return (
    <PageContent
      title={"Loans"}
      subtitle={"Request new loans and make payments towards financed loans."}
      customerActions={
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width={300}
        >
          <LinearProgressBar value={roundedLimitPercent} />
          <Box mt={1}>
            <Typography variant="body2">
              {`${
                financialSummary !== null
                  ? formatCurrency(financialSummary.available_limit)
                  : "TBD"
              } left to borrow`}
            </Typography>
          </Box>
        </Box>
      }
    >
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Active Loans" />
        <Tab label="Closed Loans" />
      </Tabs>
      {selectedTabIndex === 0 ? (
        <CustomerLoansActiveTab
          companyId={companyId}
          productType={productType}
        />
      ) : (
        <CustomerLoansClosedTab
          companyId={companyId}
          productType={productType}
        />
      )}
    </PageContent>
  );
}

export default CustomerLoansPageContent;

import { Box, Tab, Tabs } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import PageContent from "components/Shared/Page/PageContent";
import {
  ProductTypeEnum,
  useGetActiveLoansForCompanyQuery,
} from "generated/graphql";
import { ProductTypeToLoanType } from "lib/enum";
import CustomerLoansActiveTab from "pages/Customer/Loans/LoansActiveTab";
import CustomerLoansClosedTab from "pages/Customer/Loans/LoansClosedTab";
import { useState } from "react";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function CustomerLoansPageContent({ companyId, productType }: Props) {
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
    alert("Error querying loans. " + error);
  }

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summaries[0] || null;
  const canCreateUpdateNewLoan =
    financialSummary && financialSummary?.available_limit > 0;

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <PageContent
      title={"Loans"}
      subtitle={
        "Request a new loan, edit an existing loan request, or make payments towards financed loans."
      }
      customerActions={
        <Box display="flex" flexDirection="column">
          {canCreateUpdateNewLoan ? (
            <Alert severity="info" style={{ alignSelf: "flex-start" }}>
              <Box maxWidth={600}>
                You have available limit and can request new loans.
              </Box>
            </Alert>
          ) : (
            <Alert severity="warning">
              <Box maxWidth={600}>
                You have reached your limit and cannot request anymore new
                loans. Please contact Bespoke if you believe this is a mistake.
              </Box>
            </Alert>
          )}
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

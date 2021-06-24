import { Box, Tab, Tabs, Typography } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import LinearProgressBar from "components/Shared/ProgressBar/LinearProgressBar";
import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import { ProductTypeEnum } from "generated/graphql";
import { round } from "lodash";
import CustomerLoansActiveTab from "pages/Customer/Loans/LoansActiveTab";
import CustomerLoansClosedTab from "pages/Customer/Loans/LoansClosedTab";
import { formatCurrency } from "lib/currency";
import { useContext, useState } from "react";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

export default function CustomerLoansPageContent({
  companyId,
  productType,
}: Props) {
  const { financialSummary } = useContext(CurrentCustomerContext);

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

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

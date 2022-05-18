import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { BankEbbaTabLabel, BankEbbaTabLabels } from "lib/enum";
import ClientSurveillanceDashboardTab from "./ClientSurveillanceDashboardTab";
import EbbaApplicationsBorrowingBaseTab from "pages/Bank/ClientSurveillance/EbbaApplicationsBorrowingBaseTab";
import EbbaApplicationsFinancialReportsTab from "pages/Bank/ClientSurveillance/EbbaApplicationsFinancialReportsTab";
import EbbaApplicationsClosedTab from "pages/Bank/ClientSurveillance/EbbaApplicationsClosedTab";
import { useGetOpenEbbaApplicationsCountForBankSubscription } from "generated/graphql";
import { ClientSurveillanceCategoryEnum } from "lib/enum";
import { useState } from "react";

const EbbaComponentMap: {
  [key in BankEbbaTabLabel]: JSX.Element;
} = {
  [BankEbbaTabLabel.Dashboard]: <ClientSurveillanceDashboardTab />,
  [BankEbbaTabLabel.FinancialReports]: <EbbaApplicationsFinancialReportsTab />,
  [BankEbbaTabLabel.BorrowingBase]: <EbbaApplicationsBorrowingBaseTab />,
  [BankEbbaTabLabel.HistoricalCertifications]: <EbbaApplicationsClosedTab />,
};

export default function BankEbbaApplicationsPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const { data, error } = useGetOpenEbbaApplicationsCountForBankSubscription({
    fetchPolicy: "network-only",
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  const borrowingBaseCertificationsCount = (
    data?.ebba_applications || []
  ).filter(
    (ebbaApplication) =>
      ebbaApplication.category === ClientSurveillanceCategoryEnum.BorrowingBase
  ).length;
  const financialReportsCertificationsCount = (
    data?.ebba_applications || []
  ).filter(
    (ebbaApplication) =>
      ebbaApplication.category ===
      ClientSurveillanceCategoryEnum.FinancialReport
  ).length;

  return (
    <Page appBarTitle={"Client Surveillance"}>
      <PageContent title={"Client Surveillance"}>
        <Box flex={1} display="flex" flexDirection="column" width="100%">
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label={`${BankEbbaTabLabel.Dashboard}`} />
            <Tab
              label={`${BankEbbaTabLabel.FinancialReports} (${financialReportsCertificationsCount})`}
            />
            <Tab
              label={`${BankEbbaTabLabel.BorrowingBase} (${borrowingBaseCertificationsCount})`}
            />
            <Tab label={BankEbbaTabLabel.HistoricalCertifications} />
          </Tabs>
          {EbbaComponentMap[BankEbbaTabLabels[selectedTabIndex]]}
        </Box>
      </PageContent>
    </Page>
  );
}

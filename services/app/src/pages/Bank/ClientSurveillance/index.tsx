import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { useGetOpenEbbaApplicationsCountForBankSubscription } from "generated/graphql";
import {
  BankEbbaTabLabel,
  BankEbbaTabLabels,
  CustomerSurveillanceCategoryEnum,
} from "lib/enum";
import ClientSurveillanceCurrentTab from "pages/Bank/ClientSurveillance/ClientSurveillanceCurrentTab";
import ClientSurveillanceHistoricalTab from "pages/Bank/ClientSurveillance/ClientSurveillanceHistoricalTab";
import EbbaApplicationsBorrowingBaseTab from "pages/Bank/ClientSurveillance/EbbaApplicationsBorrowingBaseTab";
import EbbaApplicationsClosedTab from "pages/Bank/ClientSurveillance/EbbaApplicationsClosedTab";
import EbbaApplicationsFinancialReportsTab from "pages/Bank/ClientSurveillance/EbbaApplicationsFinancialReportsTab";
import { useState } from "react";

const EbbaComponentMap: {
  [key in BankEbbaTabLabel]: JSX.Element;
} = {
  [BankEbbaTabLabel.SurveillanceCurrent]: <ClientSurveillanceCurrentTab />,
  [BankEbbaTabLabel.FinancialReports]: <EbbaApplicationsFinancialReportsTab />,
  [BankEbbaTabLabel.BorrowingBase]: <EbbaApplicationsBorrowingBaseTab />,
  [BankEbbaTabLabel.SurveillanceHistorical]: (
    <ClientSurveillanceHistoricalTab />
  ),
  [BankEbbaTabLabel.AllCertifications]: <EbbaApplicationsClosedTab />,
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
      ebbaApplication.category ===
      CustomerSurveillanceCategoryEnum.BorrowingBase
  ).length;
  const financialReportsCertificationsCount = (
    data?.ebba_applications || []
  ).filter(
    (ebbaApplication) =>
      ebbaApplication.category ===
      CustomerSurveillanceCategoryEnum.FinancialReport
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
            <Tab label={`${BankEbbaTabLabel.SurveillanceCurrent}`} />
            <Tab
              label={`${BankEbbaTabLabel.FinancialReports} (${financialReportsCertificationsCount})`}
            />
            <Tab
              label={`${BankEbbaTabLabel.BorrowingBase} (${borrowingBaseCertificationsCount})`}
            />
            <Tab label={`${BankEbbaTabLabel.SurveillanceHistorical}`} />
            <Tab label={BankEbbaTabLabel.AllCertifications} />
          </Tabs>
          {EbbaComponentMap[BankEbbaTabLabels[selectedTabIndex]]}
        </Box>
      </PageContent>
    </Page>
  );
}

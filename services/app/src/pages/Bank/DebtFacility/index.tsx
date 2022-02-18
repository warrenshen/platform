import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import DebtFacilityOpenTab from "pages/Bank/DebtFacility/DebtFacilityOpenTab";
import DebtFacilityActionRequiredTab from "pages/Bank/DebtFacility/DebtFacilityActionRequiredTab";
import DebtFacilityAllTab from "pages/Bank/DebtFacility/DebtFacilityAllTab";
import DebtFacilityReportTab from "pages/Bank/DebtFacility/DebtFacilityReportTab";
import DebtFacilityAdminTab from "pages/Bank/DebtFacility/DebtFacilityAdminTab";
import { useGetOpenLoansByDebtFacilityStatusesSubscription } from "generated/graphql";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

const SectionSpace = styled.div`
  height: 24px;
`;

export default function BankDebtFacilityPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const { data, error } = useGetOpenLoansByDebtFacilityStatusesSubscription({
    variables: {
      statuses: ["update_required"],
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }
  const loansWithRequiredUpdate = data?.loans || [];
  const updateRequiredCount = loansWithRequiredUpdate.length;

  return (
    <Page appBarTitle={"Debt Facility"}>
      <PageContent title={"Debt Facility"}>
        <Container>
          <Box display="flex" flexDirection="row">
            <Box width="50%" flexDirection="row">
              Stub for numerical debt facility capacity
            </Box>
            <Box width="50%" flexDirection="row" alignItems="right">
              Stub for percentage debt facility capacity
            </Box>
          </Box>
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label="Open" />
            <Tab label={`Action Required (${updateRequiredCount})`} />
            <Tab label="All" />
            <Tab label="Report" />
            <Tab label="Admin" />
          </Tabs>
          <SectionSpace />
          {selectedTabIndex === 0 ? (
            <DebtFacilityOpenTab />
          ) : selectedTabIndex === 1 ? (
            <DebtFacilityActionRequiredTab loans={loansWithRequiredUpdate} />
          ) : selectedTabIndex === 2 ? (
            <DebtFacilityAllTab />
          ) : selectedTabIndex === 3 ? (
            <DebtFacilityReportTab />
          ) : (
            <DebtFacilityAdminTab />
          )}
        </Container>
      </PageContent>
    </Page>
  );
}

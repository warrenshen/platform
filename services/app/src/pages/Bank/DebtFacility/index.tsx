import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import DebtFacilityOpenTab from "pages/Bank/DebtFacility/DebtFacilityOpenTab";
import DebtFacilityActionRequiredTab from "pages/Bank/DebtFacility/DebtFacilityActionRequiredTab";
import DebtFacilityAllTab from "pages/Bank/DebtFacility/DebtFacilityAllTab";
import DebtFacilityReportTab from "pages/Bank/DebtFacility/DebtFacilityReportTab";
import DebtFacilityAdminTab from "pages/Bank/DebtFacility/DebtFacilityAdminTab";
import DebtFacilityCapacitySummary from "components/DebtFacility/DebtFacilityCapacitySummary";
import {
  useGetDebtFacilityCurrentCapacitiesSubscription,
  useGetOpenLoansByDebtFacilityStatusesSubscription,
} from "generated/graphql";
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

  // Pulls data for action required tab, grabs data here to update count in tab
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

  // Get maximum capacity number
  const {
    data: capacityData,
    error: capacityError,
  } = useGetDebtFacilityCurrentCapacitiesSubscription();
  if (capacityError) {
    console.error({ capacityError });
  }
  const debtFacilities = capacityData?.debt_facilities || [];
  const totalCapacity = debtFacilities
    .map((facility) => {
      return facility.debt_facility_capacities[0]?.amount;
    })
    .reduce((a, b) => a + b, 0);

  // Get total of loans currently in the debt facility
  const {
    data: debtFacilityData,
    error: debtFacilityError,
  } = useGetOpenLoansByDebtFacilityStatusesSubscription({
    variables: {
      statuses: ["sold_into_debt_facility"],
    },
  });
  if (debtFacilityError) {
    console.error({ debtFacilityError });
    alert(`Error in query (details in console): ${debtFacilityError.message}`);
  }
  const debtFacilityLoans = debtFacilityData?.loans || [];
  const currentUsage = debtFacilityLoans
    .map((loan) => {
      return loan.outstanding_principal_balance;
    })
    .reduce((a, b) => a + b, 0);

  return (
    <Page appBarTitle={"Debt Facility"}>
      <PageContent title={"Debt Facility"}>
        <Container>
          <DebtFacilityCapacitySummary
            currentUsage={currentUsage}
            maxCapacity={totalCapacity}
          />
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

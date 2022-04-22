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
  DebtFacilities,
  GetDebtFacilitiesSubscription,
  useGetOpenLoansByDebtFacilityStatusesSubscription,
  useGetDebtFacilitiesSubscription,
} from "generated/graphql";
import {
  DebtFacilityStatusEnum,
  DebtFacilityTabLabel,
  DebtFacilityTabLabels,
  ProductTypeEnum,
} from "lib/enum";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useFilterDebtFacilityLoansBySearchQuery } from "hooks/useFilterDebtFacilityLoans";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

const SectionSpace = styled.div`
  height: 24px;
`;

type Facilities = GetDebtFacilitiesSubscription["debt_facilities"];

export default function BankDebtFacilityPage() {
  // Get debt facilities to pass around for autocomplete and admin tab
  const {
    data: facilityData,
    error: facilityError,
  } = useGetDebtFacilitiesSubscription();
  if (facilityError) {
    console.error({ facilityError });
    alert(`Error in query (details in console): ${facilityError.message}`);
  }
  const facilities = facilityData?.debt_facilities || [];
  const allFacilityIds = facilities.map((facility) => facility.id);
  const defaultDebtFacilityId = facilities.length === 1 ? facilities[0].id : "";

  return (
    <Page appBarTitle={"Debt Facility"}>
      <PageContent title={"Debt Facility"}>
        <DebtFacilityPage
          facilities={facilities}
          allFacilityIds={allFacilityIds}
          defaultDebtFacilityId={defaultDebtFacilityId}
        />
      </PageContent>
    </Page>
  );
}

interface Props {
  facilities: Facilities;
  allFacilityIds: string[];
  defaultDebtFacilityId: string;
}

function DebtFacilityPage({
  facilities,
  allFacilityIds,
  defaultDebtFacilityId,
}: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [actionRequiredSearchQuery, setActionRequiredSearchQuery] = useState(
    ""
  );
  const [selectedDebtFacilityId, setSelectedDebtFacilityId] = useState<
    DebtFacilities["id"]
  >(defaultDebtFacilityId);
  const [
    selectedDebtFacilitySupportedProductTypes,
    setSelectedDebtFacilitySupportedProductTypes,
  ] = useState<ProductTypeEnum[]>([]);

  // Pulls data for action required tab, grabs data here to update count in tab
  const { data, error } = useGetOpenLoansByDebtFacilityStatusesSubscription({
    variables: {
      statuses: [DebtFacilityStatusEnum.UPDATE_REQUIRED],
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }
  const loansWithRequiredUpdate = useFilterDebtFacilityLoansBySearchQuery(
    actionRequiredSearchQuery,
    data
  );
  const updateRequiredCount = loansWithRequiredUpdate.length;

  useEffect(() => {
    setSelectedDebtFacilityId(defaultDebtFacilityId);
  }, [defaultDebtFacilityId]);

  return (
    <Container>
      <DebtFacilityCapacitySummary
        facilities={facilities}
        allFacilityIds={allFacilityIds}
        selectedDebtFacilityId={selectedDebtFacilityId}
        setSelectedDebtFacilityId={setSelectedDebtFacilityId}
        setSelectedDebtFacilitySupportedProductTypes={
          setSelectedDebtFacilitySupportedProductTypes
        }
        defaultDebtFacilityId={defaultDebtFacilityId}
      />
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        {DebtFacilityTabLabels.map((label: DebtFacilityTabLabel) => (
          <Tab
            key={label}
            label={
              label === DebtFacilityTabLabel.ActionRequired
                ? `Action Required (${updateRequiredCount})`
                : label
            }
          />
        ))}
      </Tabs>
      <SectionSpace />
      {selectedTabIndex === 0 ? (
        <DebtFacilityOpenTab
          facilities={facilities}
          selectedDebtFacilityId={selectedDebtFacilityId}
          allFacilityIds={allFacilityIds}
          supportedProductTypes={selectedDebtFacilitySupportedProductTypes}
          defaultDebtFacilityId={defaultDebtFacilityId}
        />
      ) : selectedTabIndex === 1 ? (
        <DebtFacilityActionRequiredTab
          loans={loansWithRequiredUpdate}
          searchQuery={actionRequiredSearchQuery}
          setSearchQuery={setActionRequiredSearchQuery}
        />
      ) : selectedTabIndex === 2 ? (
        <DebtFacilityAllTab />
      ) : selectedTabIndex === 3 ? (
        <DebtFacilityReportTab
          facilities={facilities}
          selectedDebtFacilityId={selectedDebtFacilityId}
          supportedProductTypes={selectedDebtFacilitySupportedProductTypes}
        />
      ) : (
        <DebtFacilityAdminTab facilities={facilities} />
      )}
    </Container>
  );
}

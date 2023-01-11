import { Tab, Tabs } from "@material-ui/core";
import DebtFacilityCapacitySummary from "components/DebtFacility/DebtFacilityCapacitySummary";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import {
  DebtFacilities,
  GetDebtFacilitiesQuery,
  useGetDebtFacilitiesQuery,
  useGetOpenLoansByDebtFacilityStatusesQuery,
} from "generated/graphql";
import { useFilterDebtFacilityLoansBySearchQuery } from "hooks/useFilterDebtFacilityLoans";
import { todayAsDateStringServer } from "lib/date";
import {
  DebtFacilityStatusEnum,
  DebtFacilityTabLabel,
  DebtFacilityTabLabels,
  ProductTypeEnum,
} from "lib/enum";
import DebtFacilityActionRequiredTab from "pages/Bank/DebtFacility/DebtFacilityActionRequiredTab";
import DebtFacilityAdminTab from "pages/Bank/DebtFacility/DebtFacilityAdminTab";
import DebtFacilityAllTab from "pages/Bank/DebtFacility/DebtFacilityAllTab";
import DebtFacilityCustomersTab from "pages/Bank/DebtFacility/DebtFacilityCustomersTab";
import DebtFacilityOpenTab from "pages/Bank/DebtFacility/DebtFacilityOpenTab";
import DebtFacilityReportTab from "pages/Bank/DebtFacility/DebtFacilityReportTab";
import { useEffect, useState } from "react";
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

type Facilities = GetDebtFacilitiesQuery["debt_facilities"];

export default function BankDebtFacilityPage() {
  // Get debt facilities to pass around for autocomplete and admin tab
  const { data: facilityData, error: facilityError } =
    useGetDebtFacilitiesQuery();
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
  const [actionRequiredSearchQuery, setActionRequiredSearchQuery] =
    useState("");
  const [selectedDebtFacilityId, setSelectedDebtFacilityId] = useState<
    DebtFacilities["id"]
  >(defaultDebtFacilityId);
  const [
    selectedDebtFacilitySupportedProductTypes,
    setSelectedDebtFacilitySupportedProductTypes,
  ] = useState<ProductTypeEnum[]>([]);

  // Pulls data for action required tab, grabs data here to update count in tab
  const { data, error } = useGetOpenLoansByDebtFacilityStatusesQuery({
    variables: {
      statuses: [DebtFacilityStatusEnum.UpdateRequired],
      target_date: todayAsDateStringServer(),
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }
  const companies = data?.companies || [];
  const companyInfoLookup = Object.assign(
    {},
    ...companies.map((company) => {
      return {
        [company.id]: (({ loans, ...c }) => c)(company),
      };
    })
  );
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
          companyInfoLookup={companyInfoLookup}
          searchQuery={actionRequiredSearchQuery}
          setSearchQuery={setActionRequiredSearchQuery}
        />
      ) : selectedTabIndex === 2 ? (
        <DebtFacilityAllTab />
      ) : selectedTabIndex === 3 ? (
        <DebtFacilityCustomersTab />
      ) : selectedTabIndex === 4 ? (
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

import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetNotFundedLoansForBankSubscription } from "generated/graphql";
import { BankFinancingRequestsTabLabels, LoanStatusEnum } from "lib/enum";
import { partition } from "lodash";
import BankFinancingRequestsActionRequiredTab from "pages/Bank/FinancingRequests/FinancingRequestsActionRequiredTab";
import BankFinancingRequestsArchivedTab from "pages/Bank/FinancingRequests/FinancingRequestsArchivedTab";
import { useContext, useMemo, useState } from "react";
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

export default function BankFinancingRequestsPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const { data, error } = useGetNotFundedLoansForBankSubscription();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [archivedLoans, actionRequiredLoans] = useMemo(() => {
    if (data?.loans) {
      return partition(
        data.loans,
        (loan) => loan.status === LoanStatusEnum.Archived
      );
    }
    return [[], []];
  }, [data]);

  return (
    <Page appBarTitle={"Financing Requests"}>
      <PageContent title={"Financing Requests"}>
        <Container>
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            {BankFinancingRequestsTabLabels.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          <SectionSpace />
          {selectedTabIndex === 0 ? (
            <BankFinancingRequestsActionRequiredTab
              financingRequests={actionRequiredLoans}
              userRole={role}
            />
          ) : (
            <BankFinancingRequestsArchivedTab
              financingRequests={archivedLoans}
              userRole={role}
            />
          )}
        </Container>
      </PageContent>
    </Page>
  );
}

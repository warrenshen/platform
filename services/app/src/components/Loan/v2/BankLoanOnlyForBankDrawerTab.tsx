import { Box } from "@material-ui/core";
import DebtFacilityEventsDataGrid from "components/DebtFacility/DebtFacilityEventsDataGrid";
import VerticalValueAndLabel from "components/Repayment/v2/VerticalValueAndLabel";
import CardContainer from "components/Shared/Card/CardContainer";
import CardLine from "components/Shared/Card/CardLine";
import TabContainer from "components/Shared/Tabs/TabContainer";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  LoanFragment,
  LoanReports,
  useGetDebtFacilityEventsByLoanReportIdQuery,
} from "generated/graphql";

interface Props {
  loan: LoanFragment;
  loanReportId: LoanReports["id"];
  debtFacilityName: string;
  isBankUser: boolean;
}

const BankLoanOnlyForBankDrawerTab = ({
  loan,
  loanReportId,
  debtFacilityName,
  isBankUser,
}: Props) => {
  const { data: debtFacilityEventsData, error: debtFacilityEventsError } =
    useGetDebtFacilityEventsByLoanReportIdQuery({
      skip: !isBankUser,
      variables: {
        loan_report_id: loanReportId,
      },
    });

  if (debtFacilityEventsError) {
    console.error({ error: debtFacilityEventsError });
    alert(
      `Error in query (details in console): ${debtFacilityEventsError.message}`
    );
  }

  const debtFacilityEvents = debtFacilityEventsData?.debt_facility_events || [];

  return (
    <TabContainer>
      <CardContainer>
        <CardLine labelText={"Platform ID"} valueText={loan.id} />
      </CardContainer>
      {!!loan.funded_at ? (
        <Box m={2}>
          <VerticalValueAndLabel
            value={debtFacilityName}
            label={"Debt facility"}
          />
          <Text textVariant={TextVariants.ParagraphLead}>
            Debt Facility Events
          </Text>
          <DebtFacilityEventsDataGrid events={debtFacilityEvents} />
        </Box>
      ) : (
        <></>
      )}
    </TabContainer>
  );
};

export default BankLoanOnlyForBankDrawerTab;

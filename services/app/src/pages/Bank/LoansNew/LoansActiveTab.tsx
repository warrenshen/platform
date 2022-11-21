import { Box } from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import LoansMaturingInDropdown from "components/Shared/FormInputs/LoansMaturingInDropdown";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { useGetFundedLoansForBankSubscription } from "generated/graphql";
import { DayInMilliseconds, parseDateStringServer } from "lib/date";
import { BankLoansMaturingInTimeWindow } from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankLoansActiveTab() {
  const navigate = useNavigate();
  const [maturingIn, setMaturingIn] = useState<string>(
    BankLoansMaturingInTimeWindow.All
  );

  const { data, error } = useGetFundedLoansForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const loans = useMemo(() => data?.loans || [], [data?.loans]);

  const filteredLoans = useMemo(() => {
    if (maturingIn === BankLoansMaturingInTimeWindow.All) {
      return loans;
    } else if (maturingIn === BankLoansMaturingInTimeWindow.PastDue) {
      return loans.filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const maturityDate = parseDateStringServer(loan.adjusted_maturity_date);
        return pastDueThreshold > maturityDate;
      });
    } else {
      return loans.filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const matureInDays =
          maturingIn === BankLoansMaturingInTimeWindow.SevenDays
            ? 7
            : maturingIn === BankLoansMaturingInTimeWindow.FourteenDays
            ? 14
            : 30;

        const matureThreshold = new Date(
          new Date(Date.now()).getTime() + matureInDays * DayInMilliseconds
        );
        const maturityDate = parseDateStringServer(loan.adjusted_maturity_date);
        return (
          matureThreshold > maturityDate && pastDueThreshold < maturityDate
        );
      });
    }
  }, [loans, maturingIn]);

  return (
    <Container>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Text textVariant={TextVariants.ParagraphLead}>{maturingIn}</Text>
        <LoansMaturingInDropdown
          dataCy="loans-maturing-in-dropdown"
          value={maturingIn}
          setValue={setMaturingIn}
        />
      </Box>
      <Box display="flex" flexDirection="column">
        <BankLoansDataGrid
          isArtifactBankNoteVisible
          isDebtFacilityStatusVisible
          isDisbursementIdentifierVisible
          isMaturityVisible
          isReportingVisible
          loans={filteredLoans}
          handleClickCustomer={(customerId) =>
            navigate(
              getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
            )
          }
        />
      </Box>
    </Container>
  );
}

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import { useGetFundedLoansForBankSubscription } from "generated/graphql";
import { parseDateStringServer } from "lib/date";
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

const matureDaysList = [7, 14, 30];

export default function BankLoansMaturingSoonTab() {
  const navigate = useNavigate();

  const [matureDays, setMatureDays] = useState(matureDaysList[1]);

  const { data, error } = useGetFundedLoansForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const loans = data?.loans;
  const maturingLoans = useMemo(
    () =>
      (loans || []).filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const matureThreshold = new Date(
          new Date(Date.now()).getTime() + matureDays * 24 * 60 * 60 * 1000
        );
        const maturityDate = parseDateStringServer(loan.adjusted_maturity_date);
        return (
          matureThreshold > maturityDate && pastDueThreshold < maturityDate
        );
      }),
    [loans, matureDays]
  );

  return (
    <Container>
      <Box mb={2}>
        <FormControl>
          <InputLabel id="select-loan-type">Loan type</InputLabel>
          <Select
            labelId="select-loan-type"
            defaultValue={matureDays}
            value={matureDays}
            onChange={({ target: { value } }) => {
              setMatureDays(value as number);
            }}
            style={{ width: 300 }}
          >
            {matureDaysList.map((days) => {
              return (
                <MenuItem key={days} value={days}>
                  {`Loans Maturing in ${days} Days`}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column">
        <BankLoansDataGrid
          isDisbursementIdentifierVisible
          isMaturityVisible
          isReportingVisible
          loans={maturingLoans}
          matureDays={matureDays}
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

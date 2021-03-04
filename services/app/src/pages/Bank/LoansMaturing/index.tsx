import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import Page from "components/Shared/Page";
import { useGetFundedLoansForBankSubscription } from "generated/graphql";
import { useMemo, useState } from "react";

const matureDaysList = [7, 14, 30];

function BankLoansMaturingPage() {
  const [matureDays, setMatureDays] = useState(matureDaysList[1]);

  const { data, error } = useGetFundedLoansForBankSubscription();

  if (error) {
    alert("Error querying loans. " + error);
  }

  const loans = data?.loans;
  const maturingLoans = useMemo(
    () =>
      (loans || []).filter((loan) => {
        const pastDueThreshold = new Date(Date.now());
        const matureThreshold = new Date(
          new Date(Date.now()).getTime() + matureDays * 24 * 60 * 60 * 1000
        );
        const maturityDate = new Date(loan.maturity_date);
        return (
          matureThreshold > maturityDate && pastDueThreshold < maturityDate
        );
      }),
    [loans, matureDays]
  );

  return (
    <Page appBarTitle={"Loans Maturing in X Days"}>
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
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <LoansDataGrid
          isCompanyVisible
          isFilteringEnabled
          isMaturityVisible
          loans={maturingLoans}
          matureDays={matureDays}
        />
      </Box>
    </Page>
  );
}

export default BankLoansMaturingPage;

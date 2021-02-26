import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import BankLoansDataGrid from "components/Loans/BankLoansDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  LoanStatusEnum,
  useLoansByStatusesForBankQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useState, useContext } from "react";

const matureDaysList = [7, 14, 30];

function BankLoansMaturingPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const [matureDays, setMatureDays] = useState(matureDaysList[1]);

  const { data, error } = useLoansByStatusesForBankQuery({
    variables: {
      statuses: [LoanStatusEnum.Funded],
    },
  });

  if (error) {
    alert("Error querying loans. " + error);
  }

  const loans = (data?.loans || []) as LoanFragment[];

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
        <BankLoansDataGrid
          isMaturityVisible
          loans={loans}
          fullView={true}
          loansPastDue={false}
          matureDays={matureDays}
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
        />
      </Box>
    </Page>
  );
}

export default BankLoansMaturingPage;

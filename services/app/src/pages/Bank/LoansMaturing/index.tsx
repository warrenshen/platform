import { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";
import {
  useAllPurchaseOrderLoansForBankQuery,
  LoanFragment,
} from "generated/graphql";
import Page from "components/Shared/Page";
import BankLoansDataGrid from "components/Shared/DataGrid/BankLoansDataGrid";

const matureDaysList = [7, 14, 30, 90];

function LoansMaturingPage() {
  useTitle("Loans Maturing | Bespoke");
  useAppBarTitle("Loans Maturing in X Days");

  const [matureDays, setMatureDays] = useState(matureDaysList[1]);

  const { data, error } = useAllPurchaseOrderLoansForBankQuery();

  if (error) {
    alert("Error querying purchase order loans. " + error);
  }

  const purchaseOrderLoans = (data?.loans || []) as LoanFragment[];

  return (
    <Page>
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
      <Box style={{ height: "80vh", width: "100%" }}>
        <BankLoansDataGrid
          purchaseOrderLoans={purchaseOrderLoans}
          fullView={true}
          loansPastDue={false}
          matureDays={matureDays}
        ></BankLoansDataGrid>
      </Box>
    </Page>
  );
}

export default LoansMaturingPage;

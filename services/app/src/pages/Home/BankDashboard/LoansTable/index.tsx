import { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  Box,
  Button,
  InputLabel,
  TextField,
} from "@material-ui/core";
import { PurchaseOrderLoanFragment } from "generated/graphql";
import LoansDataGrid from "./LoansDataGrid";

const loanTypes = {
  N: (n: number) => ({
    loansPastDue: false,
    label: `Purchase Order Loans in the last ${n} days`,
    matureDays: n,
  }),
  ALL: {
    loansPastDue: false,
    label: "All Purchase Order Loans",
    matureDays: null,
  },
  LOANS_PAST_DUE: {
    loansPastDue: true,
    label: "Loans past due",
    matureDays: null,
  },
};
const loanTypesList = [
  loanTypes.ALL,
  ...[2, 5, 7, 15, 30, 60, 90].map((n) => loanTypes.N(n)),
  loanTypes.LOANS_PAST_DUE,
];

interface Props {
  purchaseOrderLoans: PurchaseOrderLoanFragment[];
  fullView: boolean;
  onFullViewClick: () => void;
}

function LoansTable({ purchaseOrderLoans, fullView, onFullViewClick }: Props) {
  const [loanType, setLoanType] = useState(0);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  useEffect(() => {
    setLoanType(0);
  }, [fullView]);

  return (
    <Box display="flex" flexDirection="column">
      <Box pb={2} display="flex" flexDirection="row-reverse">
        <Box mr={2} mt={"auto"} mb={"auto"}>
          <Button
            onClick={onFullViewClick}
            variant="contained"
            color="primary"
            style={{ width: 200 }}
          >
            {fullView ? "Back to dashboard" : "View all"}
          </Button>
        </Box>
        {fullView && (
          <Box mr={2}>
            <FormControl>
              <InputLabel id="select-loan-type">Loan type</InputLabel>
              <Select
                labelId="select-loan-type"
                defaultValue={loanType}
                value={loanType}
                onChange={({ target: { value } }) => {
                  setLoanType(value as number);
                }}
                style={{ width: 300 }}
              >
                {loanTypesList.map((loanType, i) => {
                  return (
                    <MenuItem key={loanType.label} value={i}>
                      {loanType.label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        )}
        {fullView && (
          <Box mr={2}>
            <TextField
              label="Customer"
              value={customerSearchQuery}
              onChange={({ target: { value } }) => {
                setCustomerSearchQuery(value);
              }}
            ></TextField>
          </Box>
        )}
      </Box>
      <Box style={{ height: fullView ? "80vh" : "auto", width: "100%" }}>
        <LoansDataGrid
          purchaseOrderLoans={purchaseOrderLoans}
          fullView={fullView}
          loansPastDue={loanTypesList[loanType].loansPastDue}
          matureDays={loanTypesList[loanType].matureDays}
          customerSearchQuery={customerSearchQuery}
          onClickCustomerName={(value) => setCustomerSearchQuery(value)}
        ></LoansDataGrid>
      </Box>
    </Box>
  );
}

export default LoansTable;

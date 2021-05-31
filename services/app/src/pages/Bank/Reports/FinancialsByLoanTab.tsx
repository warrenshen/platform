import {
  Box,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import {
  Companies,
  useGetCustomersWithMetadataQuery,
  Loans,
  useGetAllLoansForCompanyQuery,
} from "generated/graphql";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",

      width: "100%",
    },
    section: {
      display: "flex",
      flexDirection: "column",
    },
    sectionSpace: {
      marginBottom: theme.spacing(4),
    },
    inputField: {
      width: 300,
    },
  })
);

export default function BankReportsFinancialsByCustomerTab() {
  const classes = useStyles();

  const [companyId, setCompanyId] = useState<Companies["id"]>("");
  const [loanId, setLoanId] = useState<Loans["id"]>("");

  const {
    data: customersData,
    error: customersError,
  } = useGetCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
  });

  const { data: loansData, error: loansError } = useGetAllLoansForCompanyQuery({
    skip: !companyId,
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  if (customersError) {
    console.error({ error: customersError });
    alert(`Error in query (details in console): ${customersError.message}`);
  }

  if (loansError) {
    console.error({ error: loansError });
    alert(`Error in query (details in console): ${loansError.message}`);
  }

  const customers = customersData?.customers || [];
  const loans = loansData?.loans || [];

  return (
    <Box className={classes.container}>
      <Box className={classes.section} mt={4}>
        <Box display="flex" mb={2}>
          <Box mr={2}>
            <FormControl className={classes.inputField}>
              <InputLabel id="customer-select-label">Customer</InputLabel>
              <Select
                disabled={customers.length <= 0}
                labelId="customer-select-label"
                id="customer-select"
                value={companyId}
                onChange={({ target: { value } }) =>
                  setCompanyId(value as string)
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {!!companyId && (
            <Box>
              <FormControl className={classes.inputField}>
                <InputLabel id="loan-select-label">Loan</InputLabel>
                <Select
                  disabled={customers.length <= 0}
                  labelId="loan-select-label"
                  id="loan-select"
                  value={loanId}
                  onChange={({ target: { value } }) =>
                    setLoanId(value as string)
                  }
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {loans.map((loan) => (
                    <MenuItem key={loan.id} value={loan.id}>
                      {loan.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
        <Box display="flex" flexDirection="column"></Box>
      </Box>
    </Box>
  );
}

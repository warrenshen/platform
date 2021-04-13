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
import FinancialSummariesDataGrid from "components/CustomerFinancialSummaries/FinancialSummariesDataGrid";
import {
  Companies,
  useGetCustomersWithMetadataQuery,
  useGetFinancialSummariesByCompanyIdQuery,
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

function BankReportsPage() {
  const classes = useStyles();

  const [companyId, setCompanyId] = useState<Companies["id"]>("");

  const {
    data: customersData,
    error: customersError,
  } = useGetCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
  });

  const {
    data: financialSummariesByCompanyIdData,
    error: financialSummariesByCompanyIdError,
  } = useGetFinancialSummariesByCompanyIdQuery({
    skip: !companyId,
    variables: {
      companyId: companyId,
    },
  });

  if (customersError) {
    alert("Error querying customers. " + customersError);
  }

  if (financialSummariesByCompanyIdError) {
    alert(
      "Error querying financial summaries by companyId. " +
        financialSummariesByCompanyIdError
    );
  }

  const customers = customersData?.customers || [];

  const financialSummariesByCompanyId =
    financialSummariesByCompanyIdData?.financial_summaries || [];

  return (
    <Box className={classes.container}>
      <Box className={classes.section} mt={4}>
        <Box mb={2}>
          <FormControl className={classes.inputField}>
            <InputLabel id="vendor-select-label">Customer</InputLabel>
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
        <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
          <FinancialSummariesDataGrid
            isExcelExport
            financialSummaries={financialSummariesByCompanyId}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default BankReportsPage;

import { Box, FormControl, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import FinancialSummariesDataGrid from "components/CustomerFinancialSummaries/FinancialSummariesDataGrid";
import {
  Companies,
  useGetCustomersWithMetadataQuery,
  useGetFinancialSummariesByCompanyIdQuery,
} from "generated/graphql";
import { useState } from "react";
import { useHistory } from "react-router-dom";

export default function BankReportsFinancialsByCustomerTab() {
  const history = useHistory();

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
    fetchPolicy: "network-only",
    skip: !companyId,
    variables: {
      companyId: companyId,
    },
  });

  if (customersError) {
    console.error({ error: customersError });
    alert(`Error in query (details in console): ${customersError.message}`);
  }

  if (financialSummariesByCompanyIdError) {
    console.error({ error: financialSummariesByCompanyIdError });
    alert(
      `Error in query (details in console): ${financialSummariesByCompanyIdError.message}`
    );
  }

  const customers = customersData?.customers || [];

  const financialSummariesByCompanyId =
    financialSummariesByCompanyIdData?.financial_summaries || [];

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        <Box display="flex" flexDirection="column" width={400} mb={2}>
          <FormControl>
            <Autocomplete
              autoHighlight
              blurOnSelect
              disabled={customers.length <= 0}
              options={customers}
              getOptionLabel={(customer) => customer.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select customer"
                  variant="outlined"
                />
              )}
              onChange={(_event, customer) =>
                setCompanyId(customer?.id || null)
              }
            />
          </FormControl>
        </Box>
        <Box display="flex" flexDirection="column">
          <FinancialSummariesDataGrid
            financialSummaries={financialSummariesByCompanyId}
            onClickCustomerName={(customerId) =>
              history.push(`/customers/${customerId}/overview`)
            }
          />
        </Box>
      </Box>
    </Box>
  );
}

import { Box, TextField } from "@material-ui/core";
import ClientSurveillanceCustomersDataGrid from "components/ClientSurveillance/ClientSurveillanceCustomersDataGrid";
import {
  CompanyFragment,
  GetCustomersWithMetadataAndLoansQuery,
  useGetCustomersWithMetadataAndLoansQuery,
} from "generated/graphql";
import { useFilterCustomers } from "hooks/useFilterCustomers";
import { todayAsDateStringServer } from "lib/date";
import { useMemo, useState } from "react";

export default function ClientSurveillanceDashboardTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompaniesIds, setSelectedCompaniesIds] = useState<
    null | CompanyFragment["id"]
  >([]);

  const { data, error } = useGetCustomersWithMetadataAndLoansQuery({
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const customers = useFilterCustomers(
    searchQuery,
    data
  ) as GetCustomersWithMetadataAndLoansQuery["customers"];

  const handleSelectCompanies = useMemo(
    () => (companies: CompanyFragment[]) =>
      setSelectedCompaniesIds(companies.map((company) => company.id)),
    [setSelectedCompaniesIds]
  );

  return (
    <Box mt={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={2}
      >
        <Box display="flex">
          <TextField
            autoFocus
            label="Search by customer name"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 300 }}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <ClientSurveillanceCustomersDataGrid
          isMultiSelectEnabled
          customers={customers}
          selectedCompaniesIds={selectedCompaniesIds}
          handleSelectCompanies={handleSelectCompanies}
        />
      </Box>
    </Box>
  );
}

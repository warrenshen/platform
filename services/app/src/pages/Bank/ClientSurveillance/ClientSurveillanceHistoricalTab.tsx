import { Box, TextField } from "@material-ui/core";
import ClientSurveillanceCustomersDataGrid from "components/ClientSurveillance/ClientSurveillanceCustomersDataGrid";
import {
  Companies,
  useGetNonDummyCustomersWithMetadataQuery,
} from "generated/graphql";
import { useFilterCustomers } from "hooks/useFilterCustomers";
import {
  getFirstDayOfMonth,
  getLastDateOfMonth,
  todayAsDateStringServer,
} from "lib/date";
import { useMemo, useState } from "react";
import DateInput from "components/Shared/FormInputs/DateInput";

export default function ClientSurveillanceHistoricalTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Companies["id"]>(
    []
  );
  const [selectedDate, setSelectedDate] = useState(todayAsDateStringServer());

  const { data, error } = useGetNonDummyCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
      start_date: getFirstDayOfMonth(selectedDate),
      end_date: getLastDateOfMonth(selectedDate),
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const customers = useFilterCustomers(searchQuery, data).filter(
    ({ financial_summaries }) => financial_summaries[0]?.product_type
  ) as Companies[];

  const handleSelectCompanies = useMemo(
    () => (companies: Companies[]) =>
      setSelectedCompanyIds(companies.map(({ id }) => id)),
    [setSelectedCompanyIds]
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
          <Box mr={2}>
            <DateInput
              id="qualify-date-date-picker"
              label="Qualifying Date"
              disableFuture
              value={selectedDate}
              onChange={(value) =>
                setSelectedDate(value || todayAsDateStringServer())
              }
            />
          </Box>
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
          selectedCompaniesIds={selectedCompanyIds}
          handleSelectCompanies={handleSelectCompanies}
        />
      </Box>
    </Box>
  );
}

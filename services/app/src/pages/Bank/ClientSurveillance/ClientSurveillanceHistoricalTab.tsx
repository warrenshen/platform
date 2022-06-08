import { Box, TextField } from "@material-ui/core";
import CustomerSurveillanceDataGrid from "components/CustomerSurveillance/CustomerSurveillanceDataGrid";
import CertificationMonthDropdown from "components/EbbaApplication/CertificationMonthDropdown";
import { CertificationOption } from "components/EbbaApplication/CertificationMonthDropdown";
import {
  CustomerSurveillanceFragment,
  GetCustomersSurveillanceSubscription,
  useGetCustomersSurveillanceSubscription,
} from "generated/graphql";
import { useFilterCustomerSurveillance } from "hooks/useFilterCustomerSurveillance";
import {
  getEndOfPreviousMonth,
  previousXMonthsCertificationDates,
} from "lib/date";
import { useMemo, useState } from "react";

export default function ClientSurveillanceHistoricalTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<
    CustomerSurveillanceFragment["id"]
  >([]);
  const [selectedDate, setSelectedDate] = useState(getEndOfPreviousMonth());

  const { data, error } = useGetCustomersSurveillanceSubscription({
    fetchPolicy: "network-only",
    variables: {
      target_date: selectedDate,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const rawCustomers = data?.customers || [];

  const activeCustomers =
    (rawCustomers.filter((customer) => {
      return customer?.most_recent_financial_summary?.[0].product_type !== null;
    }) as CustomerSurveillanceFragment[]) || [];

  const customers = useFilterCustomerSurveillance(
    searchQuery,
    activeCustomers
  ) as GetCustomersSurveillanceSubscription["customers"];

  const handleSelectCompanies = useMemo(
    () => (companies: CustomerSurveillanceFragment[]) =>
      setSelectedCompanyIds(companies.map(({ id }) => id)),
    [setSelectedCompanyIds]
  );

  const certificationDateOptions: CertificationOption[] =
    previousXMonthsCertificationDates(12).map((certificationDate) => ({
      certificationDate,
      isOptionDisabled: false,
    }));

  return (
    <Box mt={2}>
      <Box display="flex" alignItems="flex-end" mb={2}>
        <Box display="flex" flexDirection="row" mr={3}>
          <TextField
            autoFocus
            label="Search by customer name"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 300 }}
          />
        </Box>
        <Box display="flex">
          <Box display="flex" flexDirection="row">
            <CertificationMonthDropdown
              isRequired={false}
              initialValue={selectedDate}
              onChange={({ target: { value } }) => {
                setSelectedDate(value);
              }}
              certificationDateOptions={certificationDateOptions}
            />
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <CustomerSurveillanceDataGrid
          customers={customers}
          selectedCompaniesIds={selectedCompanyIds}
          targetDate={selectedDate}
          handleSelectCompanies={handleSelectCompanies}
        />
      </Box>
    </Box>
  );
}

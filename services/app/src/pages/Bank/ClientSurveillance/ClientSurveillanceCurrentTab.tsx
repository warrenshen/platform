import { Box, TextField } from "@material-ui/core";
import CertifyCustomerSurveillanceStatusModal from "components/CustomerSurveillance/CertifyCustomerSurveillanceStatusModal";
import CustomerSurveillanceDataGrid from "components/CustomerSurveillance/CustomerSurveillanceDataGrid";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CustomerSurveillanceFragment,
  GetCustomersSurveillanceSubscription,
  useGetCustomersSurveillanceSubscription,
} from "generated/graphql";
import { useFilterCustomerSurveillance } from "hooks/useFilterCustomerSurveillance";
import { getEndOfPreviousMonth } from "lib/date";
import { useMemo, useState } from "react";

export default function ClientSurveillanceCurrentTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<
    CustomerSurveillanceFragment["id"][]
  >([]);

  const { data, error } = useGetCustomersSurveillanceSubscription({
    fetchPolicy: "network-only",
    variables: {
      target_date: getEndOfPreviousMonth(),
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
        <Box display="flex" flexDirection="row-reverse">
          <Box>
            <ModalButton
              label={"Certify Surveillance"}
              color={"primary"}
              isDisabled={selectedCompanyIds.length !== 1}
              modal={({ handleClose }) => {
                const selectedCustomer = customers.find(
                  ({ id }) => id === selectedCompanyIds[0]
                );

                if (selectedCustomer) {
                  return (
                    <CertifyCustomerSurveillanceStatusModal
                      customer={selectedCustomer}
                      handleClose={() => {
                        setSelectedCompanyIds([]);
                        handleClose();
                      }}
                    />
                  );
                }
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <CustomerSurveillanceDataGrid
          isMultiSelectEnabled
          isFinancialReportDateVisible
          isBorrowingBaseDateVisible
          isCurrent
          isLoansReadyForAdvancesAmountVisible
          customers={customers}
          selectedCompaniesIds={selectedCompanyIds}
          targetDate={getEndOfPreviousMonth()}
          handleSelectCompanies={handleSelectCompanies}
        />
      </Box>
    </Box>
  );
}

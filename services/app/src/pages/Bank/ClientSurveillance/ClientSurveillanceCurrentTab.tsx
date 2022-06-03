import { Box, TextField } from "@material-ui/core";
import CustomerSurveillanceDataGrid from "components/CustomerSurveillance/CustomerSurveillanceDataGrid";
import EditCustomerSurveillanceStatusModal from "components/CustomerSurveillance/EditCustomerSurveillanceStatusModal";
import ModalButton from "components/Shared/Modal/ModalButton";
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
import { ActionType } from "lib/enum";
import { useMemo, useState } from "react";

export default function ClientSurveillanceCurrentTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Companies["id"]>(
    []
  );
  const todaysDate = todayAsDateStringServer();
  const { data, refetch, error } = useGetNonDummyCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
    variables: {
      date: todaysDate,
      start_date: getFirstDayOfMonth(todaysDate),
      end_date: getLastDateOfMonth(todaysDate),
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
              label={"Edit CS Status"}
              color={"primary"}
              isDisabled={selectedCompanyIds.length !== 1}
              modal={({ handleClose }) => {
                const selectedCustomer = customers.find(
                  ({ id }) => id === selectedCompanyIds[0]
                );

                if (selectedCustomer) {
                  return (
                    <EditCustomerSurveillanceStatusModal
                      actionType={
                        selectedCustomer.customer_surveillance_results.length
                          ? ActionType.Update
                          : ActionType.New
                      }
                      company={selectedCustomer}
                      qualifyingDate={todaysDate}
                      handleClose={() => {
                        refetch();
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
          isLoansReadyForAdvancesAmountVisible
          customers={customers}
          selectedCompaniesIds={selectedCompanyIds}
          handleSelectCompanies={handleSelectCompanies}
        />
      </Box>
    </Box>
  );
}

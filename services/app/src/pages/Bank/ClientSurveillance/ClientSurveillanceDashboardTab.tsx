import { Box, TextField } from "@material-ui/core";
import ClientSurveillanceCustomersDataGrid from "components/ClientSurveillance/ClientSurveillanceCustomersDataGrid";
import ClientBankStatusNoteModal from "components/ClientSurveillance/ClientBankStatusNoteModal";
import EditClientSurveillanceStatusModal from "components/ClientSurveillance/EditClientSurveillanceStatusModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  useGetNonDummyCustomersWithMetadataQuery,
} from "generated/graphql";
import { useFilterCustomers } from "hooks/useFilterCustomers";
import {
  getFirstDayOfMonth,
  getLastDateOfMonth,
  previousBizDayAsDateStringServer,
  todayAsDateStringServer,
} from "lib/date";
import { useMemo, useState } from "react";
import DateInput from "components/Shared/FormInputs/DateInput";
import { ActionType } from "lib/enum";

export default function ClientSurveillanceDashboardTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Companies["id"]>(
    []
  );
  const [clickedBankNoteCompanyId, setClickedBankNoteCompanyId] = useState(
    null
  );
  const [selectedDate, setSelectedDate] = useState(
    previousBizDayAsDateStringServer()
  );

  const { data, refetch, error } = useGetNonDummyCustomersWithMetadataQuery({
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

  const handleClickCompanyBankStatusNote = useMemo(
    () => (companyId: Companies["id"]) => {
      setClickedBankNoteCompanyId(companyId);
    },
    [setClickedBankNoteCompanyId]
  );

  const renderBankNoteModal = () => {
    if (!!clickedBankNoteCompanyId) {
      const company = customers.find(
        ({ id }) => id === clickedBankNoteCompanyId
      );

      return (
        <ClientBankStatusNoteModal
          companyName={company?.name || ""}
          bankStatusNote={
            company?.company_product_qualifications?.[0].bank_note || ""
          }
          handleClose={() => setClickedBankNoteCompanyId(null)}
        />
      );
    }
  };

  return (
    <Box mt={2}>
      {renderBankNoteModal()}
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
                setSelectedDate(value || previousBizDayAsDateStringServer())
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
                    <EditClientSurveillanceStatusModal
                      actionType={
                        selectedCustomer.company_product_qualifications.length
                          ? ActionType.Update
                          : ActionType.New
                      }
                      client={selectedCustomer}
                      qualifyingDate={selectedDate}
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
        <ClientSurveillanceCustomersDataGrid
          isMultiSelectEnabled
          customers={customers}
          selectedCompaniesIds={selectedCompanyIds}
          handleSelectCompanies={handleSelectCompanies}
          handleClickCompanyBankStatusNote={handleClickCompanyBankStatusNote}
        />
      </Box>
    </Box>
  );
}

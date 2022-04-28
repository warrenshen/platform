import { Box, TextField } from "@material-ui/core";
import ClientSurveillanceCustomersDataGrid from "components/ClientSurveillance/ClientSurveillanceCustomersDataGrid";
import ClientBankStatusNoteModal from "components/ClientSurveillance/ClientBankStatusNoteModal";
import EditClientSurveillanceStatusModal from "components/ClientSurveillance/EditClientSurveillanceStatusModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import { Companies, useGetCustomersWithMetadataQuery } from "generated/graphql";
import { useFilterCustomers } from "hooks/useFilterCustomers";
import { todayAsDateStringServer } from "lib/date";
import { useMemo, useState } from "react";

export default function ClientSurveillanceDashboardTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Companies["id"]>(
    []
  );
  const [clickedBankNoteCompanyId, setClickedBankNoteCompanyId] = useState(
    null
  );

  const { data, refetch, error } = useGetCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const customers = useFilterCustomers(searchQuery, data) as Companies[];

  const handleSelectCompanies = useMemo(
    () => (companies: Companies[]) =>
      setSelectedCompanyIds(companies.map(({ id }) => id)),
    [setSelectedCompanyIds]
  );

  const renderBankNoteModal = () => {
    if (!!clickedBankNoteCompanyId) {
      const company = customers.find(
        ({ id }) => id === clickedBankNoteCompanyId
      );

      return (
        <ClientBankStatusNoteModal
          companyName={company?.name || ""}
          bankStatusNote={company?.bank_status_note || ""}
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
                      client={selectedCustomer}
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
          handleClickCompanyBankStatusNote={(companyId) =>
            setClickedBankNoteCompanyId(companyId)
          }
        />
      </Box>
    </Box>
  );
}

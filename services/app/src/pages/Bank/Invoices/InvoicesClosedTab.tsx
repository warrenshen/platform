import { Box, TextField } from "@material-ui/core";
import DeleteInvoiceModal from "components/Invoice/DeleteInvoiceModal";
import InvoicesDataGrid from "components/Invoices/InvoicesDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  InvoiceFragment,
  Invoices,
  useGetAllConfirmedInvoicesSubscription,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { filter } from "lodash";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BankInvoicesClosedTab() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Invoices["id"]>(
    []
  );

  const { data, error } = useGetAllConfirmedInvoicesSubscription({
    fetchPolicy: "network-only",
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const invoices = useMemo(() => {
    const filteredInvoices = filter(
      data?.invoices || [],
      (invoice) =>
        `${invoice.company.name} ${invoice.invoice_number}`
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return filteredInvoices;
  }, [searchQuery, data?.invoices]);

  const selectedInvoice = useMemo(
    () =>
      selectedInvoiceIds.length === 1
        ? invoices.find((invoice) => invoice.id === selectedInvoiceIds[0])
        : null,
    [invoices, selectedInvoiceIds]
  );

  const handleSelectedInvoices = useMemo(
    () => (invoices: InvoiceFragment[]) => {
      setSelectedInvoiceIds(invoices.map((invoice) => invoice.id));
    },
    [setSelectedInvoiceIds]
  );

  return (
    <Box mt={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={2}
      >
        <Box display="flex">
          <TextField
            autoFocus
            label="Search by Invoice number or customer name"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 400 }}
          />
        </Box>
        <Box display="flex" flexDirection="row-reverse">
          <Can perform={Action.DeleteInvoices}>
            <Box mr={2}>
              <ModalButton
                isDisabled={selectedInvoiceIds.length !== 1}
                label={"Delete Invoice"}
                variant={"outlined"}
                modal={({ handleClose }) =>
                  selectedInvoice ? (
                    <DeleteInvoiceModal
                      invoiceId={selectedInvoice.id}
                      handleClose={() => {
                        handleClose();
                        setSelectedInvoiceIds([]);
                      }}
                    />
                  ) : null
                }
              />
            </Box>
          </Can>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <InvoicesDataGrid
          isCompanyVisible
          isMultiSelectEnabled
          invoices={invoices}
          selectedInvoiceIds={selectedInvoiceIds}
          handleClickCustomer={(customerId) =>
            navigate(
              getBankCompanyRoute(customerId, BankCompanyRouteEnum.Invoices)
            )
          }
          handleSelectedInvoices={handleSelectedInvoices}
        />
      </Box>
    </Box>
  );
}

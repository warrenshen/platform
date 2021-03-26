import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CreateUpdateInvoiceModal from "components/Invoices/CreateUpdateInvoiceModal";
import InvoicesDataGrid from "components/Invoices/InvoicesDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  InvoiceFragment,
  Invoices,
  useGetInvoicesByCompanyIdQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
import { useContext, useMemo, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    section: {
      display: "flex",
      flexDirection: "column",
    },
    sectionSpace: {
      height: theme.spacing(4),
    },
  })
);

export default function AllInvoicesList() {
  const classes = useStyles();

  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, refetch, error } = useGetInvoicesByCompanyIdQuery({
    variables: {
      company_id: companyId,
    },
  });
  if (!!error) {
    console.error("Failed fetching company invoices:", error);
  }

  console.log(data);

  const invoices = useMemo(() => data?.invoices || [], [data?.invoices]);

  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<
    Invoices["id"][]
  >([]);

  const handleSelectInvoices = useMemo(
    () => (invoices: InvoiceFragment[]) =>
      setSelectedInvoiceIds(invoices.map((i) => i.id)),
    [setSelectedInvoiceIds]
  );

  return (
    <Page appBarTitle="Invoices">
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        className={classes.section}
      >
        <Typography variant="h6">Invoices</Typography>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.AddInvoices}>
            <ModalButton
              isDisabled={selectedInvoiceIds.length !== 0}
              label={"Create Invoice for Payor"}
              modal={({ handleClose }) => (
                <CreateUpdateInvoiceModal
                  isInvoiceForLoan={false}
                  actionType={ActionType.New}
                  invoiceId={null}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Can>
          <Can perform={Action.EditInvoices}>
            <Box mr={1}>
              <ModalButton
                isDisabled={selectedInvoiceIds.length !== 1}
                label={"Edit Invoice"}
                modal={({ handleClose }) => (
                  <CreateUpdateInvoiceModal
                    isInvoiceForLoan={false}
                    actionType={ActionType.Update}
                    invoiceId={selectedInvoiceIds[0]}
                    handleClose={() => {
                      refetch();
                      handleClose();
                      handleSelectInvoices([]);
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>
      </Box>
      <Box>
        <InvoicesDataGrid
          isCompanyVisible={false}
          invoices={invoices}
          selectedInvoiceIds={selectedInvoiceIds}
          handleSelectedInvoices={handleSelectInvoices}
        />
      </Box>
    </Page>
  );
}

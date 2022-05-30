import {
  Box,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import DeleteInvoiceModal from "components/Invoice/DeleteInvoiceModal";
import CreateUpdateInvoiceLoanModal from "components/Invoices/CreateUpdateInvoiceLoanModal";
import CreateUpdateInvoiceModal from "components/Invoices/CreateUpdateInvoiceModal";
import InvoicesDataGrid from "components/Invoices/InvoicesDataGrid";
import RequestPaymentOnInvoiceModal from "components/Invoices/RequestPaymentOnInvoiceModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  InvoiceFragment,
  Invoices,
  useGetOpenInvoicesByCompanyIdQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType, ProductTypeEnum } from "lib/enum";
import { useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

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

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

export default function CustomerInvoicesOpenTab({
  companyId,
  productType,
}: Props) {
  const classes = useStyles();

  const { data, refetch, error } = useGetOpenInvoicesByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const invoices = useMemo(() => data?.invoices || [], [data?.invoices]);

  const notApprovedInvoices = useMemo(
    () => invoices.filter((invoice) => !invoice.approved_at),
    [invoices]
  );

  const approvedInvoices = useMemo(
    () => invoices.filter((invoice) => !!invoice.approved_at),
    [invoices]
  );

  const [selectedNotApprovedInvoiceIds, setSelectedNotApprovedInvoiceIds] =
    useState<Invoices["id"][]>([]);

  const handleSelectNotApprovedInvoices = useMemo(
    () => (invoices: InvoiceFragment[]) =>
      setSelectedNotApprovedInvoiceIds(invoices.map((i) => i.id)),
    [setSelectedNotApprovedInvoiceIds]
  );

  const selectedNotApprovedInvoice = useMemo(
    () =>
      selectedNotApprovedInvoiceIds.length === 1
        ? notApprovedInvoices.find(
            (invoice) => invoice.id === selectedNotApprovedInvoiceIds[0]
          )
        : null,
    [notApprovedInvoices, selectedNotApprovedInvoiceIds]
  );

  const [selectedApprovedInvoiceIds, setSelectedApprovedInvoiceIds] = useState<
    Invoices["id"][]
  >([]);

  const handleSelectApprovedInvoices = useMemo(
    () => (invoices: InvoiceFragment[]) =>
      setSelectedApprovedInvoiceIds(invoices.map((i) => i.id)),
    [setSelectedApprovedInvoiceIds]
  );

  const selectedApprovedInvoice = useMemo(
    () =>
      selectedApprovedInvoiceIds.length === 1
        ? approvedInvoices.find(
            (invoice) => invoice.id === selectedApprovedInvoiceIds[0]
          )
        : null,
    [approvedInvoices, selectedApprovedInvoiceIds]
  );

  return (
    <Container>
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        className={classes.section}
      >
        <Box className={classes.sectionSpace} />
        <Typography variant="h6">Not Approved by Payor Yet</Typography>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.AddInvoices}>
            <ModalButton
              isDisabled={selectedNotApprovedInvoiceIds.length !== 0}
              label={"Create Invoice"}
              modal={({ handleClose }) => (
                <CreateUpdateInvoiceModal
                  isInvoiceForLoan
                  actionType={ActionType.New}
                  companyId={companyId}
                  invoiceId={null}
                  productType={productType}
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
                isDisabled={!selectedNotApprovedInvoice}
                label={"Edit Invoice"}
                modal={({ handleClose }) => (
                  <CreateUpdateInvoiceModal
                    isInvoiceForLoan
                    actionType={ActionType.Update}
                    companyId={companyId}
                    invoiceId={selectedNotApprovedInvoice?.id}
                    productType={productType}
                    handleClose={() => {
                      refetch();
                      handleClose();
                      handleSelectNotApprovedInvoices([]);
                    }}
                  />
                )}
              />
            </Box>
          </Can>
          <Can perform={Action.DeleteInvoices}>
            <Box mr={2}>
              <ModalButton
                isDisabled={!selectedNotApprovedInvoice}
                label={"Delete Invoice"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <DeleteInvoiceModal
                    invoiceId={selectedNotApprovedInvoice?.id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                      setSelectedNotApprovedInvoiceIds([]);
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
          invoices={notApprovedInvoices}
          selectedInvoiceIds={selectedNotApprovedInvoiceIds}
          handleSelectedInvoices={handleSelectNotApprovedInvoices}
        />
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Typography variant="h6">Ready to Request Financing</Typography>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.FundInvoices}>
            <Box>
              <ModalButton
                isDisabled={!selectedApprovedInvoice}
                label={"Fund Invoice"}
                modal={({ handleClose }) => {
                  const handler = () => {
                    refetch();
                    handleClose();
                    setSelectedApprovedInvoiceIds([]);
                  };
                  return (
                    <CreateUpdateInvoiceLoanModal
                      companyId={companyId}
                      productType={productType}
                      actionType={ActionType.New}
                      loanId={null}
                      artifactId={selectedApprovedInvoice?.id}
                      handleClose={handler}
                    />
                  );
                }}
              />
            </Box>
          </Can>
          <Can perform={Action.RequestPaymentOnInvoices}>
            <Box mr={1}>
              <ModalButton
                isDisabled={!selectedApprovedInvoiceIds.length}
                label={"Request Payment From Payor"}
                modal={({ handleClose }) => (
                  <RequestPaymentOnInvoiceModal
                    invoices={invoices.filter(
                      (invoice: InvoiceFragment) =>
                        selectedApprovedInvoiceIds.indexOf(invoice.id) >= 0
                    )}
                    handleClose={handleClose}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>
        <InvoicesDataGrid
          isCompanyVisible={false}
          isMultiSelectEnabled={true}
          invoices={approvedInvoices}
          selectedInvoiceIds={selectedApprovedInvoiceIds}
          handleSelectedInvoices={handleSelectApprovedInvoices}
        />
      </Box>
    </Container>
  );
}

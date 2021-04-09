import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
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
  ProductTypeEnum,
  useGetInvoicesByCompanyIdQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
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

export default function InvoicesFundedUnfundedList({
  companyId,
  productType,
}: Props) {
  const classes = useStyles();

  const { data, refetch, error } = useGetInvoicesByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });
  if (!!error) {
    console.error("Failed fetching company invoices:", error);
  }

  const invoices = useMemo(() => data?.invoices || [], [data?.invoices]);

  const fundedInvoices = useMemo(
    () => invoices.filter((invoice) => !!invoice.funded_at),
    [invoices]
  );

  const unfundedInvoices = useMemo(
    () => invoices.filter((invoice) => !invoice.funded_at),
    [invoices]
  );

  const [selectedFundedInvoiceIds, setSelectedFundedInvoiceIds] = useState<
    Invoices["id"][]
  >([]);

  const handleSelectFundedInvoiceIds = useMemo(
    () => (invoices: InvoiceFragment[]) =>
      setSelectedFundedInvoiceIds(invoices.map((i) => i.id)),
    [setSelectedFundedInvoiceIds]
  );

  const [selectedUnfundedInvoiceIds, setSelectedUnfundedInvoiceIds] = useState<
    Invoices["id"][]
  >([]);

  const handleSelectUnfundedInvoiceIds = useMemo(
    () => (invoices: InvoiceFragment[]) =>
      setSelectedUnfundedInvoiceIds(invoices.map((i) => i.id)),
    [setSelectedUnfundedInvoiceIds]
  );

  return (
    <Container>
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        className={classes.section}
      >
        <Typography variant="h6">Not Fully Funded</Typography>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.AddInvoices}>
            <ModalButton
              isDisabled={selectedUnfundedInvoiceIds.length !== 0}
              label={"Create Invoice"}
              modal={({ handleClose }) => (
                <CreateUpdateInvoiceModal
                  isInvoiceForLoan
                  actionType={ActionType.New}
                  companyId={companyId}
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
                isDisabled={selectedUnfundedInvoiceIds.length !== 1}
                label={"Edit Invoice"}
                modal={({ handleClose }) => (
                  <CreateUpdateInvoiceModal
                    isInvoiceForLoan
                    actionType={ActionType.Update}
                    companyId={companyId}
                    invoiceId={selectedUnfundedInvoiceIds[0]}
                    handleClose={() => {
                      refetch();
                      handleClose();
                      handleSelectFundedInvoiceIds([]);
                    }}
                  />
                )}
              />
            </Box>
          </Can>
          <Can perform={Action.FundInvoices}>
            <Box mr={1}>
              <ModalButton
                isDisabled={selectedUnfundedInvoiceIds.length !== 1}
                label={"Fund Invoice"}
                modal={({ handleClose }) => {
                  const handler = () => {
                    refetch();
                    handleClose();
                    setSelectedUnfundedInvoiceIds([]);
                  };
                  return (
                    <CreateUpdateInvoiceLoanModal
                      companyId={companyId}
                      productType={productType}
                      actionType={ActionType.New}
                      loanId=""
                      artifactId={selectedUnfundedInvoiceIds[0]}
                      handleClose={handler}
                    />
                  );
                }}
              />
            </Box>
          </Can>
        </Box>
      </Box>
      <Box>
        <InvoicesDataGrid
          isCompanyVisible={false}
          invoices={unfundedInvoices}
          selectedInvoiceIds={selectedUnfundedInvoiceIds}
          handleSelectedInvoices={handleSelectUnfundedInvoiceIds}
        />
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Typography variant="h6">Fully Funded</Typography>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.RequestPaymentOnInvoices}>
            <Box mr={1}>
              <ModalButton
                isDisabled={!selectedFundedInvoiceIds.length}
                label={"Request Payment"}
                modal={({ handleClose }) => (
                  <RequestPaymentOnInvoiceModal
                    invoices={invoices.filter(
                      (invoice: InvoiceFragment) =>
                        selectedFundedInvoiceIds.indexOf(invoice.id) >= 0
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
          invoices={fundedInvoices}
          selectedInvoiceIds={selectedFundedInvoiceIds}
          handleSelectedInvoices={handleSelectFundedInvoiceIds}
        />
      </Box>
    </Container>
  );
}

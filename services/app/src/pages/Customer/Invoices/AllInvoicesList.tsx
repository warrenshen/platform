import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import CreateUpdateInvoiceModal from "components/Invoices/CreateUpdateInvoiceModal";
import InvoicesDataGrid from "components/Invoices/InvoicesDataGrid";
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

export default function AllInvoicesList({ companyId, productType }: Props) {
  const classes = useStyles();

  const { data, refetch, error } = useGetInvoicesByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
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
    <Container>
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        className={classes.section}
      >
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.AddInvoices}>
            <ModalButton
              isDisabled={selectedInvoiceIds.length !== 0}
              label={"Create Invoice for Payor"}
              modal={({ handleClose }) => (
                <CreateUpdateInvoiceModal
                  isInvoiceForLoan={false}
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
                isDisabled={selectedInvoiceIds.length !== 1}
                label={"Edit Invoice"}
                modal={({ handleClose }) => (
                  <CreateUpdateInvoiceModal
                    isInvoiceForLoan={false}
                    actionType={ActionType.Update}
                    companyId={companyId}
                    invoiceId={selectedInvoiceIds[0]}
                    productType={productType}
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
    </Container>
  );
}

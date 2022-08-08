import { Box, Theme, createStyles, makeStyles } from "@material-ui/core";
import CreateUpdatePurchaseOrderModal from "components/PurchaseOrder/CreateUpdatePurchaseOrderModal";
import PurchaseOrdersDataGrid from "components/PurchaseOrder/PurchaseOrdersDataGrid";
import ReopenPurchaseOrderModal from "components/PurchaseOrder/ReopenPurchaseOrderModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetClosedPurchaseOrdersByCompanyIdQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType, ProductTypeEnum } from "lib/enum";
import { useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;
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

export default function CustomerPurchaseOrdersClosedTabNew({
  companyId,
  productType,
}: Props) {
  const classes = useStyles();

  const { data, error, refetch } = useGetClosedPurchaseOrdersByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = useMemo(
    () => data?.purchase_orders || [],
    [data?.purchase_orders]
  );

  const [selectedPurchaseOrderIds, setSelectedPurchaseOrderIds] = useState<
    PurchaseOrders["id"][]
  >([]);

  const selectedPurchaseOrder = useMemo(
    () =>
      selectedPurchaseOrderIds.length === 1
        ? purchaseOrders.find(
            (approvedPurchaseOrder) =>
              approvedPurchaseOrder.id === selectedPurchaseOrderIds[0]
          )
        : null,
    [purchaseOrders, selectedPurchaseOrderIds]
  );

  const handleSelectPurchaseOrders = useMemo(
    () => (purchaseOrders: PurchaseOrderFragment[]) =>
      setSelectedPurchaseOrderIds(
        purchaseOrders.map((purchaseOrder) => purchaseOrder.id)
      ),
    [setSelectedPurchaseOrderIds]
  );

  return (
    <Container>
      <Box flex={1} display="flex" flexDirection="column" width="100%">
        <Box className={classes.section}>
          <Box my={2} display="flex" flexDirection="row-reverse">
            <Can perform={Action.EditPurchaseOrders}>
              <Box>
                <ModalButton
                  isDisabled={!selectedPurchaseOrder}
                  label={"Edit PO"}
                  modal={({ handleClose }) => (
                    <CreateUpdatePurchaseOrderModal
                      actionType={ActionType.Update}
                      companyId={companyId}
                      purchaseOrderId={selectedPurchaseOrder?.id}
                      productType={productType}
                      handleClose={() => {
                        refetch();
                        handleClose();
                        setSelectedPurchaseOrderIds([]);
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            <Can perform={Action.ReopenPurchaseOrders}>
              <Box mr={2}>
                <ModalButton
                  isDisabled={!selectedPurchaseOrder}
                  label={"Reopen PO"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <ReopenPurchaseOrderModal
                      purchaseOrder={selectedPurchaseOrder || null}
                      handleClose={() => {
                        refetch();
                        handleClose();
                        setSelectedPurchaseOrderIds([]);
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
          </Box>
          <PurchaseOrdersDataGrid
            isCompanyVisible={false}
            purchaseOrders={purchaseOrders}
            selectedPurchaseOrderIds={selectedPurchaseOrderIds}
            handleSelectPurchaseOrders={handleSelectPurchaseOrders}
          />
        </Box>
      </Box>
    </Container>
  );
}

import { Box, Theme, createStyles, makeStyles } from "@material-ui/core";
import ArchivePurchaseOrderModalNew from "components/PurchaseOrder/v2/ArchivePurchaseOrderModalNew";
import PurchaseOrdersDataGridNew from "components/PurchaseOrder/v2/PurchaseOrdersDataGridNew";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import Can from "components/Shared/Can";
import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import {
  Companies,
  PurchaseOrderFragment,
  PurchaseOrderLimitedNewFragment,
  PurchaseOrders,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ClosedNewPurchaseOrderStatuses, ProductTypeEnum } from "lib/enum";
import { useContext, useMemo, useState } from "react";
import styled from "styled-components";

import LinearFinancialSummaryOverview from "./LinearFinancialSummaryOverview";

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
  isActiveContract: boolean;
  purchaseOrders: PurchaseOrderLimitedNewFragment[];
  refetchPurchaseOrders: () => void;
}

export default function CustomerPurchaseOrdersClosedTabNew({
  companyId,
  productType,
  isActiveContract,
  purchaseOrders,
  refetchPurchaseOrders,
}: Props) {
  const classes = useStyles();

  const { financialSummary } = useContext(CurrentCustomerContext);

  const [isUnArchiveModalOpen, setIsUnArchiveModalOpen] = useState(false);
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
      {isUnArchiveModalOpen && (
        <ArchivePurchaseOrderModalNew
          action={Action.ReopenPurchaseOrders}
          purchaseOrder={selectedPurchaseOrder}
          handleClose={() => {
            setSelectedPurchaseOrderIds([]);
            setIsUnArchiveModalOpen(false);
            refetchPurchaseOrders();
          }}
        />
      )}
      {financialSummary && (
        <Box mt={3}>
          <LinearFinancialSummaryOverview {...financialSummary} />
        </Box>
      )}
      <Box flex={1} display="flex" flexDirection="column" width="100%">
        <Box className={classes.section}>
          <Box my={2} display="flex" flexDirection="row-reverse">
            {selectedPurchaseOrderIds.length > 0 && (
              <Can perform={Action.ReopenPurchaseOrders}>
                <Box mr={2}>
                  <SecondaryButton
                    isDisabled={!selectedPurchaseOrder || !isActiveContract}
                    text={"Unarchive"}
                    onClick={() => setIsUnArchiveModalOpen(true)}
                  />
                </Box>
              </Can>
            )}
          </Box>
          <PurchaseOrdersDataGridNew
            isCompanyVisible={false}
            purchaseOrders={purchaseOrders}
            selectedPurchaseOrderIds={selectedPurchaseOrderIds}
            selectablePurchaseOrderStatuses={ClosedNewPurchaseOrderStatuses}
            handleSelectPurchaseOrders={handleSelectPurchaseOrders}
          />
        </Box>
      </Box>
    </Container>
  );
}

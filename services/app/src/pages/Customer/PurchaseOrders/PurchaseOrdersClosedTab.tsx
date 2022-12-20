import { Box, Theme, createStyles, makeStyles } from "@material-ui/core";
import ArchivePurchaseOrderModal from "components/PurchaseOrder/v2/ArchivePurchaseOrderModal";
import PurchaseOrdersDataGrid from "components/PurchaseOrder/v2/PurchaseOrdersDataGrid";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import Can from "components/Shared/Can";
import LinearFinancialSummaryOverview from "components/Shared/FinancialSummaries/LinearFinancialSummaryOverview";
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

export default function CustomerPurchaseOrdersClosedTab({
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
        <ArchivePurchaseOrderModal
          action={Action.ReopenPurchaseOrders}
          purchaseOrder={selectedPurchaseOrder}
          handleClose={() => {
            setSelectedPurchaseOrderIds([]);
            setIsUnArchiveModalOpen(false);
            refetchPurchaseOrders();
          }}
        />
      )}
      <Box mt={3}>
        <LinearFinancialSummaryOverview
          adjustedTotalLimit={financialSummary?.adjusted_total_limit || null}
          availableLimit={financialSummary?.available_limit || null}
        />
      </Box>
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
          <PurchaseOrdersDataGrid
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

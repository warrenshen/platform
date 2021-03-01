import { Box } from "@material-ui/core";
import CreateUpdatePurchaseOrderLoanModal from "components/Loan/CreateUpdatePurchaseOrderLoanModal";
import CreateUpdatePurchaseOrderModal from "components/PurchaseOrders/CreateUpdatePurchaseOrderModal";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  PurchaseOrderFragment,
  PurchaseOrders,
  usePurchaseOrdersByCompanyIdQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
import { useContext, useMemo, useState } from "react";

function PurchaseOrdersPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, refetch, error } = usePurchaseOrdersByCompanyIdQuery({
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    window.console.log("Error querying purchase orders. Error: " + error);
  }

  const purchaseOrders = data?.purchase_orders || [];

  const [selectedPurchaseOrderIds, setSelectedPurchaseOrderIds] = useState<
    PurchaseOrders["id"][]
  >([]);

  const handleSelectPurchaseOrders = useMemo(
    () => (purchaseOrders: PurchaseOrderFragment[]) =>
      setSelectedPurchaseOrderIds(
        purchaseOrders.map((purchaseOrder) => purchaseOrder.id)
      ),
    [setSelectedPurchaseOrderIds]
  );

  return (
    <Page appBarTitle={"Purchase Orders"}>
      <Box flex={1} display="flex" flexDirection="column" width="100%">
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.AddPurchaseOrders}>
            <ModalButton
              isDisabled={selectedPurchaseOrderIds.length !== 0}
              label={"Create PO"}
              modal={({ handleClose }) => (
                <CreateUpdatePurchaseOrderModal
                  actionType={ActionType.New}
                  purchaseOrderId={null}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Can>
          <Can perform={Action.EditPurchaseOrders}>
            <Box mr={1}>
              <ModalButton
                isDisabled={selectedPurchaseOrderIds.length !== 1}
                label={"Edit PO"}
                modal={({ handleClose }) => (
                  <CreateUpdatePurchaseOrderModal
                    actionType={ActionType.Update}
                    purchaseOrderId={selectedPurchaseOrderIds[0]}
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
          <Can perform={Action.FundPurchaseOrders}>
            <Box mr={1}>
              <ModalButton
                isDisabled={selectedPurchaseOrderIds.length !== 1}
                label={"Fund PO"}
                modal={({ handleClose }) => (
                  <CreateUpdatePurchaseOrderLoanModal
                    actionType={ActionType.New}
                    loanId=""
                    artifactId={selectedPurchaseOrderIds[0]}
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
    </Page>
  );
}

export default PurchaseOrdersPage;

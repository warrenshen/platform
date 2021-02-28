import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import CreateUpdatePurchaseOrderLoanModal from "components/Loan/CreateUpdatePurchaseOrderLoanModal";
import CreateUpdatePurchaseOrderModal from "components/PurchaseOrders/CreateUpdatePurchaseOrderModal";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import Can from "components/Shared/Can";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { usePurchaseOrdersByCompanyIdQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
import React, { useContext, useState } from "react";

function PurchaseOrdersPage() {
  const {
    user: { companyId, role },
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateLoanModalOpen, setIsCreateLoanModalOpen] = useState(false);
  const [targetPurchaseOrderId, setTargetPurchaseOrderId] = useState("");

  const handleEditPurchaseOrder = (purchaseOrderId: string) => {
    setTargetPurchaseOrderId(purchaseOrderId);
    setIsEditModalOpen(true);
  };

  const handleFundPurchaseOrder = (purchaseOrderId: string) => {
    setTargetPurchaseOrderId(purchaseOrderId);
    setIsCreateLoanModalOpen(true);
  };

  return (
    <Page appBarTitle={"Purchase Orders"}>
      <Box flex={1} display="flex" flexDirection="column" width="100%">
        {isCreateLoanModalOpen && (
          <CreateUpdatePurchaseOrderLoanModal
            actionType={ActionType.New}
            loanId=""
            artifactId={targetPurchaseOrderId}
            handleClose={() => {
              refetch();
              setIsCreateLoanModalOpen(false);
              setTargetPurchaseOrderId("");
            }}
          />
        )}
        {isEditModalOpen && (
          <CreateUpdatePurchaseOrderModal
            actionType={
              targetPurchaseOrderId === "" ? ActionType.New : ActionType.Update
            }
            purchaseOrderId={targetPurchaseOrderId}
            handleClose={() => {
              refetch();
              setIsEditModalOpen(false);
              setTargetPurchaseOrderId("");
            }}
          />
        )}
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.AddPurchaseOrders}>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="contained"
              color="primary"
            >
              Create Purchase Order
            </Button>
          </Can>
        </Box>
        <PurchaseOrdersDataGrid
          isCompanyVisible={false}
          purchaseOrders={purchaseOrders}
          actionItems={
            check(role, Action.ViewPurchaseOrdersActionMenu)
              ? [
                  ...(check(role, Action.EditPurchaseOrderLoan)
                    ? [
                        {
                          key: "edit-purchase-order",
                          label: "Edit",
                          handleClick: (params: ValueFormatterParams) =>
                            handleEditPurchaseOrder(
                              params.row.data.id as string
                            ),
                        },
                      ]
                    : []),
                  ...(check(role, Action.FundPurchaseOrderLoan)
                    ? [
                        {
                          key: "fund-purchase-order",
                          label: "Fund",
                          handleClick: (params: ValueFormatterParams) =>
                            handleFundPurchaseOrder(
                              params.row.data.id as string
                            ),
                        },
                      ]
                    : []),
                ]
              : []
          }
        />
      </Box>
    </Page>
  );
}

export default PurchaseOrdersPage;

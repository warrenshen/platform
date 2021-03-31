import { Box } from "@material-ui/core";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetNotConfirmedPurchaseOrdersQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext } from "react";

function BankPurchaseOrdersActiveTab() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, error } = useGetNotConfirmedPurchaseOrdersQuery();

  if (error) {
    window.console.log("Error querying purchase orders. Error: " + error);
  }

  const purchaseOrders = data?.purchase_orders || [];

  return (
    <Box mt={3}>
      <Box display="flex" flexDirection="row-reverse">
        {/* <Can perform={Action.AddPurchaseOrderLoan}>
          <ModalButton
            isDisabled={!canCreateUpdateNewLoan || selectedLoanIds.length !== 0}
            label={"Request New Loan"}
            modal={({ handleClose }) => (
              <CreateUpdatePolymorphicLoanModal
                companyId={companyId}
                productType={productType}
                actionType={ActionType.New}
                artifactId={null}
                loanId={null}
                handleClose={() => {
                  handleDataChange();
                  handleClose();
                }}
              />
            )}
          />
        </Can> */}
      </Box>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <PurchaseOrdersDataGrid
          isCompanyVisible
          isExcelExport
          purchaseOrders={purchaseOrders}
          actionItems={
            check(role, Action.ViewPurchaseOrdersActionMenu) ? [] : []
          }
        />
      </Box>
    </Box>
  );
}

export default BankPurchaseOrdersActiveTab;

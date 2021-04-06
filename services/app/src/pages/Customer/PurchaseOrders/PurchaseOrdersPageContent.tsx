import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CreateMultiplePurchaseOrdersLoansModal from "components/Loan/CreateMultiplePurchaseOrdersLoansModal";
import CreateUpdatePurchaseOrderLoanModal from "components/Loan/CreateUpdatePurchaseOrderLoanModal";
import CreateUpdatePurchaseOrderModal from "components/PurchaseOrders/CreateUpdatePurchaseOrderModal";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  ProductTypeEnum,
  PurchaseOrderFragment,
  PurchaseOrders,
  usePurchaseOrdersByCompanyIdQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
import { useMemo, useState } from "react";

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

function CustomerPurchaseOrdersPageContent({ companyId, productType }: Props) {
  const classes = useStyles();

  const { data, refetch, error } = usePurchaseOrdersByCompanyIdQuery({
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    window.console.log("Error querying purchase orders. Error: " + error);
  }

  const purchaseOrders = useMemo(() => data?.purchase_orders || [], [
    data?.purchase_orders,
  ]);

  const fundedPurchaseOrders = useMemo(
    () => purchaseOrders.filter((po) => !!po.funded_at),
    [purchaseOrders]
  );

  const unfundedPurchaseOrders = useMemo(
    () => purchaseOrders.filter((po) => !po.funded_at),
    [purchaseOrders]
  );

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
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      width="100%"
      className={classes.section}
    >
      <Typography variant="h6">Not Fully Funded</Typography>
      <Box mb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <ModalButton
            isDisabled={selectedPurchaseOrderIds.length !== 0}
            label={"Create PO"}
            modal={({ handleClose }) => (
              <CreateUpdatePurchaseOrderModal
                actionType={ActionType.New}
                companyId={companyId}
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
                  companyId={companyId}
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
              isDisabled={!selectedPurchaseOrderIds.length}
              label={"Fund PO"}
              modal={({ handleClose }) => {
                const handler = () => {
                  refetch();
                  handleClose();
                  setSelectedPurchaseOrderIds([]);
                };
                if (selectedPurchaseOrderIds.length > 1) {
                  return (
                    <CreateMultiplePurchaseOrdersLoansModal
                      artifactIds={selectedPurchaseOrderIds}
                      handleClose={handler}
                    />
                  );
                }
                return (
                  <CreateUpdatePurchaseOrderLoanModal
                    actionType={ActionType.New}
                    companyId={companyId}
                    productType={productType}
                    loanId={null}
                    artifactId={selectedPurchaseOrderIds[0]}
                    handleClose={handler}
                  />
                );
              }}
            />
          </Box>
        </Can>
      </Box>
      <Box>
        <PurchaseOrdersDataGrid
          isCompanyVisible={false}
          purchaseOrders={unfundedPurchaseOrders}
          selectedPurchaseOrderIds={selectedPurchaseOrderIds}
          handleSelectPurchaseOrders={handleSelectPurchaseOrders}
        />
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Typography variant="h6">Fully Funded</Typography>
        <Box className={classes.sectionSpace} />
        <PurchaseOrdersDataGrid
          isCompanyVisible={false}
          isMultiSelectEnabled={false}
          purchaseOrders={fundedPurchaseOrders}
          selectedPurchaseOrderIds={[]}
          handleSelectPurchaseOrders={() => {}}
        />
      </Box>
    </Box>
  );
}

export default CustomerPurchaseOrdersPageContent;

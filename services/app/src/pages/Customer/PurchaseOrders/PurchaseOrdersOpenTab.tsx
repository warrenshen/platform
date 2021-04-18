import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CreateMultiplePurchaseOrdersLoansModal from "components/Loan/CreateMultiplePurchaseOrdersLoansModal";
import CreateUpdatePurchaseOrderLoanModal from "components/Loan/CreateUpdatePurchaseOrderLoanModal";
import DeletePurchaseOrderModal from "components/PurchaseOrder/DeletePurchaseOrderModal";
import CreateUpdatePurchaseOrderModal from "components/PurchaseOrders/CreateUpdatePurchaseOrderModal";
import PurchaseOrdersDataGrid from "components/PurchaseOrders/PurchaseOrdersDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  ProductTypeEnum,
  PurchaseOrderFragment,
  PurchaseOrders,
  useGetOpenPurchaseOrdersByCompanyIdQuery,
  UserRolesEnum,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
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
}

function CustomerPurchaseOrdersOpenTab({ companyId, productType }: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = role === UserRolesEnum.BankAdmin;

  const { data, refetch, error } = useGetOpenPurchaseOrdersByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const purchaseOrders = useMemo(() => data?.purchase_orders || [], [
    data?.purchase_orders,
  ]);

  const notApprovedPurchaseOrders = useMemo(
    () => purchaseOrders.filter((purchaseOrder) => !purchaseOrder.approved_at),
    [purchaseOrders]
  );

  const approvedPurchaseOrders = useMemo(
    () => purchaseOrders.filter((purchaseOrder) => !!purchaseOrder.approved_at),
    [purchaseOrders]
  );

  const [selectedPurchaseOrderIds, setSelectedPurchaseOrderIds] = useState<
    PurchaseOrders["id"][]
  >([]);

  const selectedPurchaseOrder = useMemo(
    () =>
      selectedPurchaseOrderIds.length === 1
        ? purchaseOrders.find(
            (purchaseOrder) => purchaseOrder.id === selectedPurchaseOrderIds[0]
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

  const [
    selectedApprovedPurchaseOrderIds,
    setSelectedApprovedPurchaseOrderIds,
  ] = useState<PurchaseOrders["id"][]>([]);

  const handleSelectApprovedPurchaseOrders = useMemo(
    () => (purchaseOrders: PurchaseOrderFragment[]) =>
      setSelectedApprovedPurchaseOrderIds(
        purchaseOrders.map((purchaseOrder) => purchaseOrder.id)
      ),
    [setSelectedApprovedPurchaseOrderIds]
  );

  return (
    <Container>
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        width="100%"
        className={classes.section}
      >
        <Box className={classes.sectionSpace} />
        <Typography variant="h6">Not Approved by Vendor Yet</Typography>
        <Box my={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.AddPurchaseOrders}>
            <ModalButton
              isDisabled={!!selectedPurchaseOrder}
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
            <Box mr={2}>
              <ModalButton
                isDisabled={!selectedPurchaseOrder}
                label={"Edit PO"}
                modal={({ handleClose }) => (
                  <CreateUpdatePurchaseOrderModal
                    actionType={ActionType.Update}
                    companyId={companyId}
                    purchaseOrderId={selectedPurchaseOrder?.id}
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
          {selectedPurchaseOrder && !selectedPurchaseOrder.requested_at && (
            <Can perform={Action.DeletePurchaseOrders}>
              <Box mr={2}>
                <ModalButton
                  isDisabled={!selectedPurchaseOrder}
                  label={"Delete PO"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <DeletePurchaseOrderModal
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
          )}
        </Box>
        <Box>
          <PurchaseOrdersDataGrid
            isCompanyVisible={false}
            isExcelExport={isBankUser}
            purchaseOrders={notApprovedPurchaseOrders}
            selectedPurchaseOrderIds={selectedPurchaseOrderIds}
            handleSelectPurchaseOrders={handleSelectPurchaseOrders}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">
            Approved by Vendor & Ready to be Funded
          </Typography>
          <Box my={2} display="flex" flexDirection="row-reverse">
            <Can perform={Action.FundPurchaseOrders}>
              <Box>
                <ModalButton
                  isDisabled={!selectedApprovedPurchaseOrderIds.length}
                  label={"Fund PO"}
                  modal={({ handleClose }) => {
                    const handler = () => {
                      refetch();
                      handleClose();
                      setSelectedApprovedPurchaseOrderIds([]);
                    };
                    return selectedApprovedPurchaseOrderIds.length > 1 ? (
                      <CreateMultiplePurchaseOrdersLoansModal
                        artifactIds={selectedApprovedPurchaseOrderIds}
                        handleClose={handler}
                      />
                    ) : (
                      <CreateUpdatePurchaseOrderLoanModal
                        actionType={ActionType.New}
                        companyId={companyId}
                        productType={productType}
                        loanId={null}
                        artifactId={selectedApprovedPurchaseOrderIds[0]}
                        handleClose={handler}
                      />
                    );
                  }}
                />
              </Box>
            </Can>
          </Box>
          <PurchaseOrdersDataGrid
            isCompanyVisible={false}
            isExcelExport={isBankUser}
            purchaseOrders={approvedPurchaseOrders}
            selectedPurchaseOrderIds={selectedApprovedPurchaseOrderIds}
            handleSelectPurchaseOrders={handleSelectApprovedPurchaseOrders}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default CustomerPurchaseOrdersOpenTab;

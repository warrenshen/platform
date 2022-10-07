import { Box, Tab, Tabs } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CreateUpdatePurchaseOrderModalNew from "components/PurchaseOrder/v2/CreateUpdatePurchaseOrderModalNew";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import PageContent from "components/Shared/Page/PageContent";
import {
  Companies,
  PurchaseOrderLimitedNewFragment,
  useGetAllPurchaseOrdersByCompanyIdNewQuery,
} from "generated/graphql";
import {
  ActionType,
  CustomerPurchaseOrdersTabLabelNew,
  CustomerPurchaseOrdersTabLabelsNew,
  ProductTypeEnum,
} from "lib/enum";
import { partition } from "lodash";
import CustomerPurchaseOrdersClosedTabNew from "pages/Customer/PurchaseOrders/PurchaseOrdersClosedTabNew";
import CustomerPurchaseOrdersOpenTabNew from "pages/Customer/PurchaseOrders/PurchaseOrdersOpenTabNew";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  isActiveContract: boolean;
}

interface TabComponentProps {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  isActiveContract: boolean;
  purchaseOrders: PurchaseOrderLimitedNewFragment[];
  refetchPurchaseOrders: () => void;
}

const PurchaseOrderComponentMap: {
  [key in CustomerPurchaseOrdersTabLabelNew]: (
    props: TabComponentProps
  ) => JSX.Element;
} = {
  [CustomerPurchaseOrdersTabLabelNew.Active]: ({
    companyId,
    productType,
    isActiveContract,
    purchaseOrders,
    refetchPurchaseOrders,
  }: TabComponentProps) => (
    <CustomerPurchaseOrdersOpenTabNew
      companyId={companyId}
      productType={productType}
      isActiveContract={isActiveContract}
      purchaseOrders={purchaseOrders}
      refetchPurchaseOrders={refetchPurchaseOrders}
    />
  ),
  [CustomerPurchaseOrdersTabLabelNew.Archived]: ({
    companyId,
    productType,
    isActiveContract,
    purchaseOrders,
    refetchPurchaseOrders,
  }: TabComponentProps) => (
    <CustomerPurchaseOrdersClosedTabNew
      companyId={companyId}
      productType={productType}
      isActiveContract={isActiveContract}
      purchaseOrders={purchaseOrders}
      refetchPurchaseOrders={refetchPurchaseOrders}
    />
  ),
};

export default function CustomerPurchaseOrdersPageContentNew({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, error, refetch } = useGetAllPurchaseOrdersByCompanyIdNewQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  const [openPurchaseOrders, closedPurchaseOrders] = useMemo(
    () =>
      data?.purchase_orders
        ? partition(data.purchase_orders, (purchaseOrder) => {
            return (
              purchaseOrder.funded_at === null &&
              purchaseOrder.closed_at === null
            );
          })
        : [[], []],
    [data?.purchase_orders]
  );

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  return (
    <>
      {isCreateModalOpen && (
        <CreateUpdatePurchaseOrderModalNew
          actionType={ActionType.New}
          purchaseOrderId={null}
          companyId={companyId}
          productType={productType}
          handleClose={() => {
            refetch();
            setIsCreateModalOpen(false);
          }}
        />
      )}
      <PageContent
        title={"Purchase Orders New"}
        subtitle={
          "Create, edit, and request financing for Purchase Orders (POs)."
        }
        customerActions={
          <Box>
            <PrimaryButton
              text={"Create PO"}
              dataCy={"create-purchase-order-button"}
              isDisabled={!isActiveContract}
              icon={<AddIcon width={24} height={24} />}
              onClick={() => {
                setIsCreateModalOpen(true);
              }}
            />
          </Box>
        }
      >
        <Tabs
          value={selectedTabIndex}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_: any, value: number) => {
            refetch();
            setSelectedTabIndex(value);
          }}
        >
          {CustomerPurchaseOrdersTabLabelsNew.map(
            (label: CustomerPurchaseOrdersTabLabelNew) => (
              <Tab
                data-cy={`${label.replace(/\s+/g, "-").toLowerCase()}-tab`}
                key={label}
                label={label}
              />
            )
          )}
        </Tabs>
        {PurchaseOrderComponentMap[
          CustomerPurchaseOrdersTabLabelsNew[selectedTabIndex]
        ]({
          companyId,
          productType,
          isActiveContract,
          purchaseOrders:
            selectedTabIndex === 0 ? openPurchaseOrders : closedPurchaseOrders,
          refetchPurchaseOrders: refetch,
        })}
      </PageContent>
    </>
  );
}

import { Box, Tab, Tabs } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CreateUpdatePurchaseOrderModalNew from "components/PurchaseOrder/v2/CreateUpdatePurchaseOrderModalNew";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import PageContent from "components/Shared/Page/PageContent";
import { Companies } from "generated/graphql";
import {
  ActionType,
  CustomerPurchaseOrdersTabLabelNew,
  CustomerPurchaseOrdersTabLabelsNew,
  ProductTypeEnum,
} from "lib/enum";
import CustomerPurchaseOrdersClosedTabNew from "pages/Customer/PurchaseOrders/PurchaseOrdersClosedTabNew";
import CustomerPurchaseOrdersOpenTabNew from "pages/Customer/PurchaseOrders/PurchaseOrdersOpenTabNew";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  isActiveContract: boolean;
}

const PurchaseOrderComponentMap: {
  [key in CustomerPurchaseOrdersTabLabelNew]: (props: Props) => JSX.Element;
} = {
  [CustomerPurchaseOrdersTabLabelNew.Active]: ({
    companyId,
    productType,
    isActiveContract,
  }: Props) => (
    <CustomerPurchaseOrdersOpenTabNew
      companyId={companyId}
      productType={productType}
      isActiveContract={isActiveContract}
    />
  ),
  [CustomerPurchaseOrdersTabLabelNew.Archived]: ({
    companyId,
    productType,
    isActiveContract,
  }: Props) => (
    <CustomerPurchaseOrdersClosedTabNew
      companyId={companyId}
      productType={productType}
      isActiveContract={isActiveContract}
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

  return (
    <>
      {isCreateModalOpen && (
        <CreateUpdatePurchaseOrderModalNew
          actionType={ActionType.New}
          purchaseOrderId={null}
          companyId={companyId}
          productType={productType}
          handleClose={() => {
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
          onChange={(_: any, value: number) => setSelectedTabIndex(value)}
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
        })}
      </PageContent>
    </>
  );
}

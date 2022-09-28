import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { Companies } from "generated/graphql";
import {
  CustomerPurchaseOrdersTabLabel,
  CustomerPurchaseOrdersTabLabels,
  ProductTypeEnum,
} from "lib/enum";
import CustomerPurchaseOrdersClosedTab from "pages/Customer/PurchaseOrders/PurchaseOrdersClosedTab";
import CustomerPurchaseOrdersOpenTab from "pages/Customer/PurchaseOrders/PurchaseOrdersOpenTab";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  isActiveContract: boolean;
}

const PurchaseOrderComponentMap: {
  [key in CustomerPurchaseOrdersTabLabel]: (props: Props) => JSX.Element;
} = {
  [CustomerPurchaseOrdersTabLabel.ActivePOs]: ({
    companyId,
    productType,
    isActiveContract,
  }: Props) => (
    <CustomerPurchaseOrdersOpenTab
      companyId={companyId}
      productType={productType}
      isActiveContract={isActiveContract}
    />
  ),
  [CustomerPurchaseOrdersTabLabel.ClosedPOs]: ({
    companyId,
    productType,
    isActiveContract,
  }: Props) => (
    <CustomerPurchaseOrdersClosedTab
      companyId={companyId}
      productType={productType}
      isActiveContract={isActiveContract}
    />
  ),
};

export default function CustomerPurchaseOrdersPageContent({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <PageContent
      title={"Purchase Orders"}
      subtitle={
        "Create new POs, edit existing POs, and request financing for approved POs."
      }
    >
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_: any, value: number) => setSelectedTabIndex(value)}
      >
        {CustomerPurchaseOrdersTabLabels.map(
          (label: CustomerPurchaseOrdersTabLabel) => (
            <Tab key={label} label={label} />
          )
        )}
      </Tabs>
      {PurchaseOrderComponentMap[
        CustomerPurchaseOrdersTabLabels[selectedTabIndex]
      ]({
        companyId,
        productType,
        isActiveContract,
      })}
    </PageContent>
  );
}

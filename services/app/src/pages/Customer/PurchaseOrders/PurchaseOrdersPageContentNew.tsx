import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { Companies } from "generated/graphql";
import {
  CustomerPurchaseOrdersTabLabel,
  CustomerPurchaseOrdersTabLabels,
  ProductTypeEnum,
} from "lib/enum";
import CustomerPurchaseOrdersClosedTabNew from "pages/Customer/PurchaseOrders/PurchaseOrdersClosedTabNew";
import CustomerPurchaseOrdersOpenTabNew from "pages/Customer/PurchaseOrders/PurchaseOrdersOpenTabNew";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

const PurchaseOrderComponentMap: {
  [key in CustomerPurchaseOrdersTabLabel]: (props: Props) => JSX.Element;
} = {
  [CustomerPurchaseOrdersTabLabel.ActivePOs]: ({
    companyId,
    productType,
  }: Props) => (
    <CustomerPurchaseOrdersOpenTabNew
      companyId={companyId}
      productType={productType}
    />
  ),
  [CustomerPurchaseOrdersTabLabel.ClosedPOs]: ({
    companyId,
    productType,
  }: Props) => (
    <CustomerPurchaseOrdersClosedTabNew
      companyId={companyId}
      productType={productType}
    />
  ),
};

export default function CustomerPurchaseOrdersPageContent({
  companyId,
  productType,
}: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <PageContent
      title={"Purchase Orders New"}
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
      })}
    </PageContent>
  );
}

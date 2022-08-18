import { Box, Tab, Tabs } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CreateUpdatePurchaseOrderModalNew from "components/PurchaseOrder/v2/CreateUpdatePurchaseOrderModalNew";
import ModalButton from "components/Shared/Modal/ModalButton";
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
}

const PurchaseOrderComponentMap: {
  [key in CustomerPurchaseOrdersTabLabelNew]: (props: Props) => JSX.Element;
} = {
  [CustomerPurchaseOrdersTabLabelNew.Active]: ({
    companyId,
    productType,
  }: Props) => (
    <CustomerPurchaseOrdersOpenTabNew
      companyId={companyId}
      productType={productType}
    />
  ),
  [CustomerPurchaseOrdersTabLabelNew.Archived]: ({
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
        "Create, edit, and request financing for Purchase Orders (POs)."
      }
      customerActions={
        <Box>
          <ModalButton
            label={"Add PO"}
            startIcon={<AddIcon />}
            modal={({ handleClose }) => (
              <CreateUpdatePurchaseOrderModalNew
                actionType={ActionType.New}
                purchaseOrderId={null}
                companyId={companyId}
                productType={productType}
                handleClose={() => {
                  handleClose();
                }}
              />
            )}
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
            <Tab key={label} label={label} />
          )
        )}
      </Tabs>
      {PurchaseOrderComponentMap[
        CustomerPurchaseOrdersTabLabelsNew[selectedTabIndex]
      ]({
        companyId,
        productType,
      })}
    </PageContent>
  );
}
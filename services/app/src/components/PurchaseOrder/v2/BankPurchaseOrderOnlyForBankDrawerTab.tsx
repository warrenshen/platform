import { PurchaseOrderViewModalProps } from "components/PurchaseOrder/v2/BankPurchaseOrderDrawer";
import PurchaseOrderBankOnlyModalCard from "components/PurchaseOrder/v2/PurchaseOrderBankOnlyModalCard";
import TabContainer from "components/Shared/Tabs/TabContainer";

const BankPurchaseOrderOnlyForBankDrawerTab = ({
  purchaseOrder,
}: PurchaseOrderViewModalProps) => {
  return (
    <TabContainer>
      <PurchaseOrderBankOnlyModalCard purchaseOrder={purchaseOrder} />
    </TabContainer>
  );
};

export default BankPurchaseOrderOnlyForBankDrawerTab;

import { Tab, Tabs } from "@material-ui/core";
import BankPurchaseOrderFinancingDrawerTab from "components/PurchaseOrder/v2/BankPurchaseOrderFinancingDrawerTab";
import BankPurchaseOrderGeneralInformationDrawerTab from "components/PurchaseOrder/v2/BankPurchaseOrderGeneralInformationDrawerTab";
import BankPurchaseOrderHistoryDrawerTab from "components/PurchaseOrder/v2/BankPurchaseOrderHistoryDrawerTab";
import BankPurchaseOrderOnlyForBankDrawerTab from "components/PurchaseOrder/v2/BankPurchaseOrderOnlyForBankDrawerTab";
import Modal from "components/Shared/Modal/Modal";
import {
  PurchaseOrderWithRelationshipsFragment,
  PurchaseOrders,
  useGetPurchaseOrderForCombinedQuery,
} from "generated/graphql";
import {
  BankPurchaseOrdersDrawerTabLabelNew,
  BankPurchaseOrdersDrawerTabLabelsNew,
} from "lib/enum";
import { useState } from "react";

export interface PurchaseOrderViewModalProps {
  purchaseOrder: PurchaseOrderWithRelationshipsFragment;
}

const PurchaseOrderTabMap: {
  [key in BankPurchaseOrdersDrawerTabLabelNew]: (
    props: PurchaseOrderViewModalProps
  ) => JSX.Element;
} = {
  [BankPurchaseOrdersDrawerTabLabelNew.GeneralInformation]:
    BankPurchaseOrderGeneralInformationDrawerTab,
  [BankPurchaseOrdersDrawerTabLabelNew.History]:
    BankPurchaseOrderHistoryDrawerTab,
  [BankPurchaseOrdersDrawerTabLabelNew.Financing]:
    BankPurchaseOrderFinancingDrawerTab,
  [BankPurchaseOrdersDrawerTabLabelNew.OnlyForBank]:
    BankPurchaseOrderOnlyForBankDrawerTab,
};

interface Props {
  purchaseOrderId: PurchaseOrders["id"];
  isBankUser: boolean;
  handleClose: () => void;
}

const BankPurchaseOrderDrawer = ({
  purchaseOrderId,
  isBankUser,
  handleClose,
}: Props) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const { data } = useGetPurchaseOrderForCombinedQuery({
    fetchPolicy: "network-only",
    variables: {
      id: purchaseOrderId,
      is_bank_user: isBankUser,
    },
  });

  const purchaseOrder = data?.purchase_orders_by_pk;

  if (!purchaseOrder) {
    return null;
  }

  const TabComponent =
    PurchaseOrderTabMap[BankPurchaseOrdersDrawerTabLabelsNew[selectedTabIndex]];

  return (
    <Modal
      title={`Purchase Order #${purchaseOrder.order_number}`}
      contentWidth={1000}
      handleClose={handleClose}
    >
      <Tabs
        centered
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_: any, value: number) => setSelectedTabIndex(value)}
        style={{
          display: "flex",
          justifyContent: "center",
          marginLeft: "100px",
          marginRight: "100px",
        }}
      >
        {BankPurchaseOrdersDrawerTabLabelsNew.map((label) => {
          if (
            !isBankUser &&
            label === BankPurchaseOrdersDrawerTabLabelNew.OnlyForBank
          ) {
            return null;
          }

          return (
            <Tab
              // Replace space with underscore and change to lower case
              // eg:- Not Confirmed Pos to not-confirmed-pos
              data-cy={label.replace(/\s+/g, "-").toLowerCase()}
              key={label}
              label={label}
              style={{ width: "200px" }}
            />
          );
        })}
      </Tabs>
      <TabComponent purchaseOrder={purchaseOrder} />
    </Modal>
  );
};

export default BankPurchaseOrderDrawer;

import { Tab, Tabs } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import {
  PurchaseOrders,
  useGetPurchaseOrderForBankQuery,
} from "generated/graphql";
import {
  BankPurchaseOrdersDrawerTabLabelNew,
  BankPurchaseOrdersDrawerTabLabelsNew,
} from "lib/enum";
import { useState } from "react";

import BankPurchaseOrderGeneralInformationDrawerTab from "./BankPurchaseOrderGeneralInformationDrawerTab";
import BankPurchaseOrderFinancingDrawerTab from "./BankPurchaseOrderGeneralInformationDrawerTab";
import BankPurchaseOrderHistoryDrawerTab from "./BankPurchaseOrderGeneralInformationDrawerTab";
import BankPurchaseOrderOnlyForBankDrawerTab from "./BankPurchaseOrderGeneralInformationDrawerTab";

const PurchaseOrderTabMap: {
  [key in BankPurchaseOrdersDrawerTabLabelNew]: JSX.Element;
} = {
  [BankPurchaseOrdersDrawerTabLabelNew.GeneralInformation]: (
    <BankPurchaseOrderGeneralInformationDrawerTab />
  ),
  [BankPurchaseOrdersDrawerTabLabelNew.History]: (
    <BankPurchaseOrderHistoryDrawerTab />
  ),
  [BankPurchaseOrdersDrawerTabLabelNew.Financing]: (
    <BankPurchaseOrderFinancingDrawerTab />
  ),
  [BankPurchaseOrdersDrawerTabLabelNew.OnlyForBank]: (
    <BankPurchaseOrderOnlyForBankDrawerTab />
  ),
};

interface Props {
  purchaseOrderId: PurchaseOrders["id"];
  handleClose: () => void;
}

const BankPurchaseOrderDrawer = ({ purchaseOrderId, handleClose }: Props) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(-1);

  const { data } = useGetPurchaseOrderForBankQuery({
    fetchPolicy: "network-only",
    variables: {
      id: purchaseOrderId,
    },
  });

  const purchaseOrder = data?.purchase_orders_by_pk;

  if (!purchaseOrder) {
    return null;
  }

  return (
    <Modal
      title={`Purchase Order #${purchaseOrder.order_number}`}
      contentWidth={800}
      handleClose={handleClose}
    >
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_: any, value: number) => setSelectedTabIndex(value)}
      >
        {BankPurchaseOrdersDrawerTabLabelsNew.map((label) => (
          <Tab
            // Replace space with underscore and change to lower case
            // eg:- Not Confirmed Pos to not-confirmed-pos
            data-cy={label.replace(/\s+/g, "-").toLowerCase()}
            key={label}
            label={label}
            style={{ width: "200px" }}
          />
        ))}
      </Tabs>
      {
        PurchaseOrderTabMap[
          BankPurchaseOrdersDrawerTabLabelsNew[selectedTabIndex]
        ]
      }
    </Modal>
  );
};

export default BankPurchaseOrderDrawer;

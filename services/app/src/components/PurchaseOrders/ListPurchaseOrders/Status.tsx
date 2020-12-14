import Create from "@material-ui/icons/Create";
import ThumbUp from "@material-ui/icons/ThumbUp";

const PurchaseOrderStatus = {
  Accepted: "Accepted",
  Paid: "Paid",
  Invoiced: "Invoiced",
  New: "New",
};

const PurchaseOrderStatusColor = {
  Accepted: "#5cb85c",
  Paid: "#5cb85c",
  Invoiced: "#f0ad4e",
  New: "#f0ad4e",
};

function Status({ statusValue }: { statusValue: string }) {
  return (
    <>
      {(statusValue === PurchaseOrderStatus.Paid ||
        statusValue === PurchaseOrderStatus.Accepted) && (
        <ThumbUp style={{ color: PurchaseOrderStatusColor.Accepted }} />
      )}
      {statusValue === PurchaseOrderStatus.Invoiced && (
        <ThumbUp style={{ color: PurchaseOrderStatusColor.Invoiced }} />
      )}
      {statusValue === PurchaseOrderStatus.New && (
        <Create style={{ color: PurchaseOrderStatusColor.New }} />
      )}
      {statusValue}
    </>
  );
}

export default Status;

import { Box } from "@material-ui/core";
import AddButton from "components/PurchaseOrders/AddPurchaseOrder/AddButton";
import ListPurchaseOrders from "components/PurchaseOrders/ListPurchaseOrders";
import { PageContext } from "contexts/PageContext";
import { useContext, useEffect, useState } from "react";
import { useTitle } from "react-use";

function PurchaseOrders() {
  useTitle("Purchase Orders | Bespoke");
  const pageContext = useContext(PageContext);

  useEffect(() => {
    pageContext.setAppBarTitle("Purchase Orders");
  }, []);

  const handleSetOpen = (value: boolean) => {
    setOpen((state) => value);
    if (!value) {
      setReloadTrigger((state) => !state);
    }
  };
  const clearId = () => {
    setId("");
  };
  const createPurchaseOrderReplica = (value: string) => {
    setId(value);
    setOpen(true);
  };

  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(false);
  return (
    <Box>
      <AddButton
        id={id}
        open={open}
        setOpen={handleSetOpen}
        clearId={clearId}
      ></AddButton>
      <ListPurchaseOrders
        reloadTrigger={reloadTrigger}
        createPurchaseOrderReplica={createPurchaseOrderReplica}
      ></ListPurchaseOrders>
    </Box>
  );
}

export default PurchaseOrders;

import { CurrentUserContext } from "contexts/CurrentUserContext";
import { ProductTypeEnum } from "generated/graphql";
import { useContext } from "react";
import AllInvoicesList from "./AllInvoicesList";
import InvoicesFundedUnfundedLists from "./InvoicesFundedUnfundedLists";

export default function CustomerInvoicesPages() {
  const {
    user: { productType },
  } = useContext(CurrentUserContext);

  switch (productType) {
    case ProductTypeEnum.InvoiceFinancing:
      return <InvoicesFundedUnfundedLists />;
    case ProductTypeEnum.PurchaseMoneyFinancing:
      return <AllInvoicesList />;
    default:
      return null;
  }
}

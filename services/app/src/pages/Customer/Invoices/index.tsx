import { CurrentUserContext } from "contexts/CurrentUserContext";
import { ProductTypeEnum } from "generated/graphql";
import { useContext } from "react";
import AllInvoicesList from "./AllInvoicesList";
import InvoicesFundedUnfundedLists from "./InvoicesFundedUnfundedLists";

export default function CustomerInvoicesPages() {
  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  switch (productType) {
    case ProductTypeEnum.InvoiceFinancing:
      return (
        <InvoicesFundedUnfundedLists
          companyId={companyId}
          productType={productType}
        />
      );
    case ProductTypeEnum.PurchaseMoneyFinancing:
      return (
        <AllInvoicesList companyId={companyId} productType={productType} />
      );
    default:
      return null;
  }
}

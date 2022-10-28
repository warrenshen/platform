import { ProductTypeEnum } from "lib/enum";
import AllInvoicesList from "pages/Customer/Invoices/AllInvoicesList";
import InvoicesFundedUnfundedLists from "pages/Customer/Invoices/InvoicesFundedUnfundedLists";

interface Props {
  companyId: string;
  productType: ProductTypeEnum | null;
}

export default function InvoicesPageContent({ companyId, productType }: Props) {
  return !!productType ? (
    productType === ProductTypeEnum.InvoiceFinancing ? (
      <InvoicesFundedUnfundedLists
        companyId={companyId}
        productType={productType}
      />
    ) : (
      <AllInvoicesList companyId={companyId} productType={productType} />
    )
  ) : null;
}

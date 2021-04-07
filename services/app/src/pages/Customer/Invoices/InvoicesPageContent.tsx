import PageContent from "components/Shared/Page/PageContent";
import { ProductTypeEnum } from "generated/graphql";
import AllInvoicesList from "pages/Customer/Invoices/AllInvoicesList";
import InvoicesFundedUnfundedLists from "pages/Customer/Invoices/InvoicesFundedUnfundedLists";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

export default function InvoicesPageContent({ companyId, productType }: Props) {
  return (
    <PageContent title={"Invoices"}>
      {productType === ProductTypeEnum.InvoiceFinancing ? (
        <InvoicesFundedUnfundedLists
          companyId={companyId}
          productType={productType}
        />
      ) : (
        <AllInvoicesList companyId={companyId} productType={productType} />
      )}
    </PageContent>
  );
}

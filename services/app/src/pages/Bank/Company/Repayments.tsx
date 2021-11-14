import { ProductTypeEnum } from "lib/enum";
import CustomerRepaymentsPageContent from "pages/Customer/Repayments/RepaymentsPageContent";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

export default function BankCustomerPaymentsSubpage({
  companyId,
  productType,
}: Props) {
  return (
    <CustomerRepaymentsPageContent
      companyId={companyId}
      productType={productType}
    />
  );
}

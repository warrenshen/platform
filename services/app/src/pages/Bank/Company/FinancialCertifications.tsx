import FinancialCertificationsPageContent from "pages/Customer/FinancialCertifications/FinancialCertificationsPageContent";
import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

export default function BankCustomerFinancialCertificationsSubpage({
  companyId,
  productType,
}: Props) {
  return (
    <FinancialCertificationsPageContent
      companyId={companyId}
      productType={productType}
    />
  );
}

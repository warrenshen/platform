import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import FinancingRequestsPageContent from "pages/Customer/FinancingRequests/FinancingRequestsPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  isActiveContract: boolean;
}

export default function BankCustomerFinancingRequestsPage({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  return (
    !!companyId &&
    !!productType && (
      <CurrentCustomerProvider companyId={companyId}>
        <FinancingRequestsPageContent
          companyId={companyId}
          productType={productType}
          isActiveContract={!!isActiveContract}
        />
      </CurrentCustomerProvider>
    )
  );
}

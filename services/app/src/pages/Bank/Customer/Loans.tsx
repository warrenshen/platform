import { ProductTypeEnum } from "generated/graphql";
import CustomerLoansPageContent from "pages/Customer/Loans/LoansPageContent";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function BankCustomerLoansSubpage({ companyId, productType }: Props) {
  return (
    <CustomerLoansPageContent companyId={companyId} productType={productType} />
  );
}

export default BankCustomerLoansSubpage;

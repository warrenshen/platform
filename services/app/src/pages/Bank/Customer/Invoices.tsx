import { Box } from "@material-ui/core";
import { ProductTypeEnum } from "generated/graphql";
import CustomerInvoicesPageContent from "pages/Customer/Invoices/InvoicesPageContent";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

export default function BankCustomerInvoicesSubpage({
  companyId,
  productType,
}: Props) {
  return (
    <Box flex={1} display="flex" flexDirection="column" width="100%">
      <CustomerInvoicesPageContent
        companyId={companyId}
        productType={productType}
      />
    </Box>
  );
}

import { Box } from "@material-ui/core";
import { Companies, ProductTypeEnum } from "generated/graphql";
import CustomerInvoicesPageContent from "pages/Customer/Invoices/InvoicesPageContent";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
}

export default function BankCustomerInvoicesSubpage({
  companyId,
  productType,
}: Props) {
  return (
    !!productType && (
      <Box flex={1} display="flex" flexDirection="column" width="100%">
        <CustomerInvoicesPageContent
          companyId={companyId}
          productType={productType}
        />
      </Box>
    )
  );
}

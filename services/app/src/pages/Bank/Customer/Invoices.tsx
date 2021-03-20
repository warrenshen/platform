import { Box } from "@material-ui/core";
import InvoicesDataGrid from "components/Invoices/InvoicesDataGrid";
import { useGetInvoicesByCompanyIdQuery } from "generated/graphql";

interface Props {
  companyId: string;
}

export default function BankCustomerInvoicesSubpage({ companyId }: Props) {
  const { data, error } = useGetInvoicesByCompanyIdQuery({
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error("Error querying purchase orders. Error", error);
  }

  const invoices = data?.invoices || [];

  return (
    <Box flex={1} display="flex" flexDirection="column" width="100%">
      <InvoicesDataGrid
        isCompanyVisible={false}
        invoices={invoices}
        isMultiSelectEnabled={false}
        isExcelExport
      />
    </Box>
  );
}

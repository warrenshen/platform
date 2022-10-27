import { GridValueFormatterParams } from "@material-ui/data-grid";
import PaymentDrawerLauncher from "components/Payment/PaymentDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { GetAdvancesByMethodAndPaymentDateQuery } from "generated/graphql";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

function getRows(
  payments: GetAdvancesByMethodAndPaymentDateQuery["payments"],
  isRepayment: boolean
) {
  return payments.map((payment) => {
    const bankAccount = isRepayment
      ? "company_bank_account"
      : "recipient_bank_account";

    return formatRowModel({
      ...payment,
      recipient_routing_number: payment[bankAccount]?.routing_number,
      recipient_bank_name: payment[bankAccount]?.bank_name,
      recipient_account_number: payment[bankAccount]?.account_number,
      recipient_account_type: payment[bankAccount]?.account_type,
      // Note: Torrey Pines (who the export of this data grid is sent to) requires account name be max 22 characters.
      recipient_account_name: (
        payment[bankAccount]?.account_title || ""
      ).substring(0, 22),
      recipient_name: payment[bankAccount]?.recipient_name,
      recipient_address: payment[bankAccount]?.recipient_address,
      recipient_address_2: payment[bankAccount]?.recipient_address_2,
      additional_info_for_recipient: payment.bank_note,
      bespoke_routing_number: payment.company_bank_account?.routing_number,
      bespoke_account_number: payment.company_bank_account?.account_number,
    });
  });
}

interface Props {
  isRepayment?: boolean;
  isExcelExport?: boolean;
  exportFileName?: string;
  payments: GetAdvancesByMethodAndPaymentDateQuery["payments"];
}

export default function AchAdvancesDataGrid({
  isRepayment = false,
  exportFileName = "Report",
  isExcelExport = true,
  payments,
}: Props) {
  const rows = getRows(payments, isRepayment);
  const columns = useMemo(
    () => [
      {
        visible: false, // Developer note: change to true if you want to debug.
        dataField: "id",
        caption: "Advance ID",
        width: 140,
        cellRender: (params: GridValueFormatterParams) => (
          <PaymentDrawerLauncher paymentId={params.row.data.id} />
        ),
      },
      {
        visible: false, // Developer note: change to true if you want to debug.
        caption: "Customer Name",
        dataField: "company.name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "recipient_routing_number",
        caption: "Routing Number",
        width: 140,
      },
      {
        dataField: "recipient_account_number",
        caption: "Account Number",
        width: 140,
      },
      {
        dataField: "recipient_account_type",
        caption: "Account Type",
        width: 140,
      },
      {
        dataField: "recipient_account_name",
        caption: "Account Name",
        width: 140,
      },
      {
        dataField: "amount",
        caption: "Default Amount",
        width: 140,
      },
      {
        dataField: "additional_info_for_recipient",
        caption: "Additional Information",
        width: 140,
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      exportFileType="csv"
      isExcelExport={isExcelExport}
      pager
      exportFileName={exportFileName}
      dataSource={rows}
      columns={columns}
    />
  );
}

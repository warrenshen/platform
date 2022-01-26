import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import PaymentDrawerLauncher from "components/Payment/PaymentDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  PaymentFragment,
  PaymentBankAccountsFragment,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(
  payments: (PaymentFragment & PaymentBankAccountsFragment)[]
): RowsProp {
  return payments.map((payment) => {
    return {
      ...payment,
      bespoke_routing_number: payment.company_bank_account?.routing_number,
      bespoke_account_number: payment.company_bank_account?.account_number,
      recipient_routing_number: payment.recipient_bank_account?.routing_number,
      recipient_bank_name: payment.recipient_bank_account?.bank_name,
      recipient_account_number: payment.recipient_bank_account?.account_number,
      recipient_account_type: payment.recipient_bank_account?.account_type,
      recipient_account_name: payment.recipient_bank_account?.account_title,
      recipient_name: payment.recipient_bank_account?.recipient_name,
      recipient_address: payment.recipient_bank_account?.recipient_address,
      recipient_address_2: payment.recipient_bank_account?.recipient_address_2,
      additional_info_for_recipient: payment.bank_note,
    };
  });
}

interface Props {
  isExcelExport?: boolean;
  payments: (PaymentFragment & PaymentBankAccountsFragment)[];
}

export default function AchAdvancesDataGrid({
  isExcelExport = true,
  payments,
}: Props) {
  const rows = getRows(payments);
  const columns = useMemo(
    () => [
      {
        visible: false, // Developer note: change to true if you want to debug.
        dataField: "id",
        caption: "Advance ID",
        width: 140,
        cellRender: (params: ValueFormatterParams) => (
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
      exportType={"csv"}
      isExcelExport={isExcelExport}
      pager
      dataSource={rows}
      columns={columns}
    />
  );
}

import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import PaymentDrawerLauncher from "components/Payment/PaymentDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { GetAdvancesByMethodAndPaymentDateQuery } from "generated/graphql";
import { formatDateString } from "lib/date";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(
  payments: GetAdvancesByMethodAndPaymentDateQuery["payments"]
): RowsProp {
  return payments.map((payment) => {
    const bespokeBankAccount = payment.company_bank_account;
    const recipientBankAccount = payment.recipient_bank_account;
    const isIntermediaryBankAccount = !!recipientBankAccount?.is_wire_intermediary;
    return {
      ...payment,
      bespoke_routing_number: bespokeBankAccount?.wire_routing_number,
      bespoke_account_type: bespokeBankAccount?.account_type,
      bespoke_account_number: bespokeBankAccount?.account_number,
      settlement_date: formatDateString(payment.settlement_date),
      currency: "USD",
      recipient_bank_type: "ABA",
      recipient_routing_number: recipientBankAccount?.wire_routing_number,
      recipient_bank_name: isIntermediaryBankAccount
        ? recipientBankAccount?.intermediary_bank_name
        : recipientBankAccount?.bank_name,
      recipient_account_number: isIntermediaryBankAccount
        ? recipientBankAccount?.intermediary_account_number
        : recipientBankAccount?.account_number,
      recipient_account_name: isIntermediaryBankAccount
        ? recipientBankAccount?.intermediary_account_name
        : recipientBankAccount?.account_title,
      recipient_address: recipientBankAccount?.recipient_address,
      recipient_address_2: recipientBankAccount?.recipient_address_2,
      wire_memo: payment.bank_note,
    };
  });
}

interface Props {
  isExcelExport?: boolean;
  payments: GetAdvancesByMethodAndPaymentDateQuery["payments"];
}

export default function WireAdvancesDataGrid({
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
        dataField: "bespoke_routing_number",
        caption: "Bespoke - Routing Number",
        width: 140,
      },
      {
        dataField: "bespoke_account_type",
        caption: "Bespoke - Account Type",
        width: 140,
      },
      {
        dataField: "bespoke_account_number",
        caption: "Bespoke - Account Number",
        width: 140,
      },
      {
        dataField: "amount",
        caption: "Amount",
        width: 140,
      },
      {
        dataField: "settlement_date",
        caption: "Send On Date",
        width: ColumnWidths.Date,
      },
      {
        dataField: "currency",
        caption: "Currency",
        width: 140,
      },
      {
        dataField: "recipient_bank_type",
        caption: "Bank ID Type",
        width: 140,
      },
      {
        dataField: "recipient_routing_number",
        caption: "Recipient - Wire Routing Number",
        width: 140,
      },
      {
        dataField: "recipient_bank_name",
        caption: "Recipient - Bank Name",
        width: 140,
      },
      {
        dataField: "recipient_account_number",
        caption: "Recipient - Account Number",
        width: 140,
      },
      {
        dataField: "recipient_account_name",
        caption: "Recipient - Account Name",
        width: 140,
      },
      {
        dataField: "recipient_address",
        caption: "Recipient - Address 1",
        width: 140,
      },
      {
        dataField: "recipient_address_2",
        caption: "Recipient - Address 2",
        width: 140,
      },
      {
        dataField: "wire_memo",
        caption: "Wire Memo",
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

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
      template_name: payment.recipient_bank_account?.torrey_pines_template_name,
      bespoke_routing_number: payment.company_bank_account?.routing_number,
      bespoke_account_number: payment.company_bank_account?.account_number,
      currency: "USD",
      bespoke_bank_type: "ABA",
      recipient_routing_number: payment.recipient_bank_account?.routing_number,
      recipient_bank_name: payment.recipient_bank_account?.bank_name,
      blank_1: "",
      blank_2: "",
      recipient_account_number: payment.recipient_bank_account?.account_number,
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
        dataField: "template_name",
        caption: "Template Name",
        width: 140,
      },
      {
        dataField: "bespoke_routing_number",
        caption: "Bank ID",
        width: 140,
      },
      {
        dataField: "bespoke_account_number",
        caption: "Account",
        width: 140,
      },
      {
        dataField: "currency",
        caption: "Currency",
        width: 140,
      },
      {
        dataField: "bespoke_bank_type",
        caption: "Bank ID Type",
        width: 140,
      },
      {
        dataField: "recipient_routing_number",
        caption: "Bank ID",
        width: 140,
      },
      {
        dataField: "recipient_bank_name",
        caption: "Bank Name",
        width: 140,
      },
      {
        dataField: "blank_1",
        caption: "",
        width: 140,
      },
      {
        dataField: "blank_2",
        caption: "",
        width: 140,
      },
      {
        dataField: "recipient_account_number",
        caption: "Recipient account",
        width: 140,
      },
      {
        dataField: "recipient_name",
        caption: "Recipient name",
        width: 140,
      },
      {
        dataField: "recipient_address",
        caption: "Recipient address",
        width: 140,
      },
      {
        dataField: "recipient_address_2",
        caption: "Recipient address 2",
        width: 140,
      },
      {
        dataField: "additional_info_for_recipient",
        caption: "Additional information for recipient",
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

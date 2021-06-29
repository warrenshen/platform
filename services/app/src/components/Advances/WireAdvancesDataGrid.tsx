import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { PaymentFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

function getRows(payments: PaymentFragment[]): RowsProp {
  return payments.map((item) => {
    return {
      ...item,
      template_name: "TBD",
      bespoke_routing_number: "TBD",
      bespoke_account_number: "TBD",
      currency: "USD",
      bespoke_bank_type: "ABA",
      blank_1: "",
      blank_2: "",
    };
  });
}

interface Props {
  payments: PaymentFragment[];
  handleClickCustomer: (value: string) => void;
  isExcelExport?: boolean;
}

export default function WireAdvancesDataGrid({
  payments,
  handleClickCustomer,
  isExcelExport = true,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = getRows(payments);
  const columns = useMemo(
    () => [
      {
        dataField: "id",
        caption: "Advance ID",
        width: 140,
      },
      {
        caption: "Customer Name",
        dataField: "company.name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            label={params.row.data.company.name}
            onClick={() => {
              handleClickCustomer(params.row.data.company.name);
              dataGrid?.instance.filter([
                "company.name",
                "=",
                params.row.data.company.name,
              ]);
            }}
          />
        ),
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
    [dataGrid?.instance, handleClickCustomer]
  );

  return (
    <ControlledDataGrid
      dataSource={rows}
      columns={columns}
      ref={(ref) => setDataGrid(ref)}
      isExcelExport={isExcelExport}
      pager
    />
  );
}

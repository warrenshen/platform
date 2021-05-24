import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  InvoiceFragment,
  Invoices,
  RequestStatusEnum,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isCompanyVisible: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  invoices: InvoiceFragment[];
  actionItems?: DataGridActionItem[];
  selectedInvoiceIds?: Invoices["id"][];
  handleSelectedInvoices?: (invoices: InvoiceFragment[]) => void;
}

export default function InvoicesDataGrid({
  isCompanyVisible,
  isMultiSelectEnabled = true,
  invoices,
  actionItems,
  selectedInvoiceIds,
  handleSelectedInvoices,
  isExcelExport = false,
}: Props) {
  const rows = useMemo(
    () =>
      invoices.map((invoice) => ({
        ...invoice,
        company_name: invoice.company?.name,
        payor_name: invoice.payor?.name,
      })),
    [invoices]
  );

  const columns = useMemo(
    () => [
      {
        dataField: "invoice_number",
        caption: "Invoice",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <InvoiceDrawerLauncher
            label={params.row.data.invoice_number as string}
            invoiceId={params.row.data.id as string}
          />
        ),
      },
      {
        dataField: "action",
        caption: "Action",
        alignment: "center",
        width: ColumnWidths.Actions,
        visible: !!actionItems && actionItems.length > 0,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        dataField: "status",
        caption: "Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <RequestStatusChip
            requestStatus={params.value as RequestStatusEnum}
          />
        ),
      },
      {
        visible: isCompanyVisible,
        dataField: "company_name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "payor_name",
        caption: "Payor Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Subtotal Amount",
        dataField: "subtotal_amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.subtotal_amount} />
        ),
      },
      {
        caption: "Taxes",
        dataField: "taxes_amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.taxes_amount} />
        ),
      },
      {
        caption: "Total Amount",
        dataField: "total_amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.total_amount} />
        ),
      },
      {
        caption: "Invoice Date",
        dataField: "invoice_date",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.invoice_date} />
        ),
      },
      {
        caption: "Due Date",
        dataField: "invoice_due_date",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.invoice_due_date} />
        ),
      },
    ],
    [isCompanyVisible, actionItems]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectedInvoices &&
      handleSelectedInvoices(selectedRowsData as InvoiceFragment[]),
    [handleSelectedInvoices]
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager
        select={isMultiSelectEnabled}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedInvoiceIds}
        onSelectionChanged={handleSelectionChanged}
        isExcelExport={isExcelExport}
      />
    </Box>
  );
}

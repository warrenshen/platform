import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import {
  Companies,
  InvoiceFragment,
  Invoices,
  RequestStatusEnum,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { ColumnWidths } from "lib/tables";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { useMemo } from "react";

interface Props {
  isCompanyVisible: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  invoices: InvoiceFragment[];
  actionItems?: DataGridActionItem[];
  selectedInvoiceIds?: Invoices["id"][];
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleSelectedInvoices?: (invoices: InvoiceFragment[]) => void;
}

function getRows(invoices: InvoiceFragment[]): RowsProp {
  return invoices.map((invoice) => {
    return {
      ...invoice,
      company_name: invoice.company?.name,
      payor_name: getCompanyDisplayName(invoice.payor),
    };
  });
}

export default function InvoicesDataGrid({
  isCompanyVisible,
  isMultiSelectEnabled = true,
  invoices,
  actionItems,
  selectedInvoiceIds,
  handleClickCustomer,
  handleSelectedInvoices,
  isExcelExport = true,
}: Props) {
  const rows = useMemo(() => getRows(invoices), [invoices]);

  const columns = useMemo(
    () => [
      {
        fixed: true,
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
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.company_name} />
        ),
      },
      {
        visible: isCompanyVisible,
        dataField: "product_type",
        caption: "Product Type",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell
            label={
              ProductTypeToLabel[
                params.row.data.company.contract.product_type as ProductTypeEnum
              ]
            }
          />
        ),
      },
      {
        dataField: "payor_name",
        caption: "Payor Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.payor_name} />
        ),
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
    <ControlledDataGrid
      pager
      select={isMultiSelectEnabled}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedInvoiceIds}
      onSelectionChanged={handleSelectionChanged}
      isExcelExport={isExcelExport}
    />
  );
}

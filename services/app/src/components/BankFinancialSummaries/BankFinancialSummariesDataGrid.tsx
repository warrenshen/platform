import { ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import { BankFinancialSummaryFragment } from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";
import CSS from "csstype";
import { formatCurrency } from "lib/number";

interface Props {
  bankFinancialSummaries: BankFinancialSummaryFragment[];
}

function DefineCellStyle(col: Number) {
  const firstCellWidth = "160px";
  const cellStyle: CSS.Properties = {
    textAlign: col === 1 ? "left" : "right",
    borderBottom: "rgb(224, 224, 224) 1px solid",
    borderCollapse: "collapse",
    height: "50px",
    lineHeight: "20px",
    paddingTop: "1px",
    paddingBottom: "1px",
    paddingLeft: col === 1 ? "18px" : "14px",
    paddingRight: col === 7 ? "18px" : "14px",
    fontFamily:
      'Roboto, RobotoFallback, "Noto Kufi Arabic", Helvetica, Arial, sans-serif',
    fontSize: "14px",
    verticalAlign: "middle",
    width: col === 1 ? firstCellWidth : "auto",
    maxWidth: col === 1 ? firstCellWidth : "auto",
    minWidth: col === 1 ? firstCellWidth : "auto",
    fontWeight: "bold",
  };

  return cellStyle;
}

export default function BankFinancialSummariesDataGrid({
  bankFinancialSummaries,
}: Props) {
  const rows = bankFinancialSummaries;
  const columns = useMemo(
    () => [
      {
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
        cellRender: (params: ValueFormatterParams) =>
          ProductTypeToLabel[params.row.data.product_type as ProductTypeEnum],
      },
      {
        dataField: "total_outstanding_principal",
        caption: "Outstanding Principal",
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_principal}
          />
        ),
      },
      {
        dataField: "total_outstanding_interest",
        caption: "Accrued Interest",
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_interest}
          />
        ),
      },
      {
        dataField: "total_outstanding_fees",
        caption: "Accrued Late Fees",
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_fees}
          />
        ),
      },
      {
        dataField: "total_principal_in_requested_state",
        caption: "Principal in Requested State",
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_principal_in_requested_state}
          />
        ),
      },
      {
        dataField: "available_limit",
        caption: "Available Limit",
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.available_limit} />
        ),
      },
      {
        dataField: "adjusted_total_limit",
        caption: "Total Limit",
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.adjusted_total_limit} />
        ),
      },
    ],
    []
  );
  const tableStyle: CSS.Properties = {
    background: "rgb(255,255,255)",
    borderSpacing: 0,
    borderCollapse: "collapse",
    tableLayout: "fixed",
    width: "100%",
  };
  const rowStyle: CSS.Properties = {
    borderCollapse: "collapse",
    borderSpacing: 0,
  };

  const summationRow =
    rows.length === 0 ? (
      <></>
    ) : (
      <table
        style={tableStyle}
        className="dx-datagrid-table dx-datagrid-table-fixed"
        role="presentation"
      >
        <tbody role="presentation">
          <tr
            style={rowStyle}
            className="dx-row dx-data-row dx-row-lines"
            role="row"
            aria-selected="false"
            aria-rowindex={1}
          >
            <td style={DefineCellStyle(1)} role="gridcell" aria-colindex={1}>
              Total
            </td>
            <td style={DefineCellStyle(2)} role="gridcell" aria-colindex={2}>
              {formatCurrency(
                rows.reduce(
                  (sum, current) => sum + current.total_outstanding_principal,
                  0
                )
              )}
            </td>
            <td style={DefineCellStyle(3)} role="gridcell" aria-colindex={3}>
              {formatCurrency(
                rows.reduce(
                  (sum, current) => sum + current.total_outstanding_interest,
                  0
                )
              )}
            </td>
            <td style={DefineCellStyle(4)} role="gridcell" aria-colindex={4}>
              {formatCurrency(
                rows.reduce(
                  (sum, current) => sum + current.total_outstanding_fees,
                  0
                )
              )}
            </td>
            <td style={DefineCellStyle(5)} role="gridcell" aria-colindex={5}>
              {formatCurrency(
                rows.reduce(
                  (sum, current) =>
                    sum + current.total_principal_in_requested_state,
                  0
                )
              )}
            </td>
            <td style={DefineCellStyle(6)} role="gridcell" aria-colindex={6}>
              {formatCurrency(
                rows.reduce((sum, current) => sum + current.available_limit, 0)
              )}
            </td>
            <td style={DefineCellStyle(7)} role="gridcell" aria-colindex={7}>
              {formatCurrency(
                rows.reduce(
                  (sum, current) => sum + current.adjusted_total_limit,
                  0
                )
              )}
            </td>
          </tr>
        </tbody>
      </table>
    );

  return (
    <>
      <ControlledDataGrid isExcelExport dataSource={rows} columns={columns} />
      {summationRow}
    </>
  );
}

import { RowsProp } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CSS from "csstype";
import { BankFinancialSummaryFragment } from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { formatCurrency, formatPercentage } from "lib/number";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

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

function getRows(
  bankFinancialSummaries: BankFinancialSummaryFragment[]
): RowsProp {
  return bankFinancialSummaries.map((bankFinancialSummary) => {
    return formatRowModel({
      ...bankFinancialSummary,
      product_type:
        ProductTypeToLabel[
          bankFinancialSummary.product_type as ProductTypeEnum
        ],
      total_outstanding_principal: formatCurrency(
        bankFinancialSummary.total_outstanding_principal
      ),
      total_outstanding_principal_past_due: formatCurrency(
        bankFinancialSummary.total_outstanding_principal_past_due
      ),
      total_outstanding_principal_percentage_past_due: formatPercentage(
        !!bankFinancialSummary.total_outstanding_principal &&
          bankFinancialSummary.total_outstanding_principal > 0
          ? (bankFinancialSummary.total_outstanding_principal_past_due || 0) /
              bankFinancialSummary.total_outstanding_principal
          : 0
      ),
      total_outstanding_interest: formatCurrency(
        bankFinancialSummary.total_outstanding_interest
      ),
      total_outstanding_fees: formatCurrency(
        bankFinancialSummary.total_outstanding_fees
      ),
      total_principal_in_requested_state: formatCurrency(
        bankFinancialSummary.total_principal_in_requested_state
      ),
      available_limit: formatCurrency(bankFinancialSummary.available_limit),
      adjusted_total_limit: formatCurrency(
        bankFinancialSummary.adjusted_total_limit
      ),
    });
  });
}

export default function BankFinancialSummariesDataGrid({
  bankFinancialSummaries,
}: Props) {
  const rows = getRows(bankFinancialSummaries);
  const columns = useMemo(
    () => [
      {
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
      },
      {
        dataField: "total_outstanding_principal",
        caption: "Outstanding Principal",
        alignment: "right",
      },
      {
        dataField: "total_outstanding_interest",
        caption: "Outstanding Interest",
        alignment: "right",
      },
      {
        dataField: "total_outstanding_fees",
        caption: "Outstanding Late Fees",
        alignment: "right",
      },
      {
        dataField: "total_principal_in_requested_state",
        caption: "Principal in Requested State",
        alignment: "right",
      },
      {
        dataField: "total_outstanding_principal_past_due",
        caption: "Outstanding Principal Past Due",
        alignment: "right",
      },
      {
        dataField: "total_outstanding_principal_percentage_past_due",
        caption: "Outstanding Principal % Past Due",
        alignment: "right",
      },
      {
        dataField: "available_limit",
        caption: "Available Limit",
        alignment: "right",
      },
      {
        dataField: "adjusted_total_limit",
        caption: "Total Limit",
        alignment: "right",
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

  const totalOutstandingPrincipal = bankFinancialSummaries.reduce(
    (sum, current) => sum + current.total_outstanding_principal,
    0
  );
  const totalOutstandingPrincipalPastDue = bankFinancialSummaries.reduce(
    (sum, current) => sum + (current.total_outstanding_principal_past_due || 0),
    0
  );

  const summationRow =
    bankFinancialSummaries.length === 0 ? (
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
              {formatCurrency(totalOutstandingPrincipal)}
            </td>
            <td style={DefineCellStyle(3)} role="gridcell" aria-colindex={3}>
              {formatCurrency(
                bankFinancialSummaries.reduce(
                  (sum, current) => sum + current.total_outstanding_interest,
                  0
                )
              )}
            </td>
            <td style={DefineCellStyle(4)} role="gridcell" aria-colindex={4}>
              {formatCurrency(
                bankFinancialSummaries.reduce(
                  (sum, current) => sum + current.total_outstanding_fees,
                  0
                )
              )}
            </td>
            <td style={DefineCellStyle(5)} role="gridcell" aria-colindex={5}>
              {formatCurrency(
                bankFinancialSummaries.reduce(
                  (sum, current) =>
                    sum + current.total_principal_in_requested_state,
                  0
                )
              )}
            </td>
            <td style={DefineCellStyle(4)} role="gridcell" aria-colindex={4}>
              {formatCurrency(totalOutstandingPrincipalPastDue)}
            </td>
            <td style={DefineCellStyle(4)} role="gridcell" aria-colindex={4}>
              {formatPercentage(
                !!totalOutstandingPrincipal && totalOutstandingPrincipal > 0
                  ? totalOutstandingPrincipalPastDue / totalOutstandingPrincipal
                  : 0
              )}
            </td>
            <td style={DefineCellStyle(6)} role="gridcell" aria-colindex={6}>
              {formatCurrency(
                bankFinancialSummaries.reduce(
                  (sum, current) => sum + current.available_limit,
                  0
                )
              )}
            </td>
            <td style={DefineCellStyle(7)} role="gridcell" aria-colindex={7}>
              {formatCurrency(
                bankFinancialSummaries.reduce(
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

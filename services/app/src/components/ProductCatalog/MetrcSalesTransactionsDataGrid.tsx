import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  MetrcSalesTransactionFragment,
  MetrcSalesTransactions,
} from "generated/graphql";
import { CurrencyPrecision, roundToFiveDigits } from "lib/number";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

const columns = [
  {
    dataField: "product_name",
    caption: "Metrc Product Name",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "product_category_name",
    caption: "Metrc Product Category",
    minWidth: ColumnWidths.MinWidth,
  },
  {
    dataField: "avg_quantity_sold",
    caption: "Quantity Sold (avg)",
    minWidth: 100,
  },
  {
    dataField: "total_price",
    caption: "Price (avg)",
    minWidth: ColumnWidths.Currency,
    format: {
      type: "currency",
      precision: CurrencyPrecision,
    },
  },
  {
    dataField: "unit_of_measure",
    caption: "Unit of Measure",
    minWidth: ColumnWidths.Identifier,
  },
];

const getRows = (salesTransactions: MetrcSalesTransactionFragment[]) => {
  return salesTransactions.map((salesTransaction) => {
    return {
      ...salesTransaction,
      avg_quantity_sold: roundToFiveDigits(salesTransaction.quantity_sold),
    };
  });
};

interface Props {
  isExcelExport?: boolean;
  isViewActionAvailable?: boolean;
  metrcSalesTransactions: MetrcSalesTransactionFragment[];
  selectedSalesTransactionIds: MetrcSalesTransactions["id"][];
  onSelectionChanged: (selectedRowKeys: any) => void;
}

const MetrcSalesTransactionsDataGrid = ({
  isExcelExport = false,
  metrcSalesTransactions,
  selectedSalesTransactionIds,
  onSelectionChanged,
}: Props) => {
  const rows = useMemo(
    () => getRows(metrcSalesTransactions),
    [metrcSalesTransactions]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled
      dataSource={rows}
      columns={columns}
      filtering={{ enable: true }}
      select
      pager
      pageSize={10}
      selectedRowKeys={selectedSalesTransactionIds}
      onSelectionChanged={onSelectionChanged}
    />
  );
};

export default MetrcSalesTransactionsDataGrid;

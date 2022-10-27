import { GridValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(minimumInterestFees: any[]) {
  return minimumInterestFees.map((minimumInterestFee) => {
    return {
      ...minimumInterestFee,
      id: minimumInterestFee.company.id,
      company_name: minimumInterestFee.company.name,
      fee_period: minimumInterestFee.fee_info?.duration,
      fee_due: minimumInterestFee.fee_info?.amount_short,
    };
  });
}

interface Props {
  isExcelExport?: boolean;
  minimumInterestFees: any;
  actionItems: DataGridActionItem[];
}

export default function MinimumInterestFeesDataGrid({
  isExcelExport = true,
  minimumInterestFees,
  actionItems,
}: Props) {
  const rows = getRows(minimumInterestFees);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        visible: !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        alignment: "center",
        width: 80,
        cellRender: (params: GridValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        fixed: true,
        dataField: "company_name",
        caption: "Company Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "fee_period",
        caption: "Minimum Interest Period",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "fee_due",
        caption: "Minimum Interest Fee Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: GridValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.fee_due} />
        ),
      },
    ],
    [actionItems]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      isSortingDisabled
      dataSource={rows}
      columns={columns}
    />
  );
}

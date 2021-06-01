import { ValueFormatterParams } from "@material-ui/data-grid";
import ContractDrawerLauncher from "components/Contract/ContractDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { ContractFragment, ProductTypeEnum } from "generated/graphql";
import { formatDateString } from "lib/date";
import { ProductTypeToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  contracts: ContractFragment[];
}

function ContractsDataGrid({
  isCompanyVisible = true,
  isExcelExport = true,
  contracts,
}: Props) {
  const rows = contracts;
  const columns = useMemo(
    () => [
      {
        dataField: "id",
        caption: "Contract",
        width: ColumnWidths.DateContract,
        cellRender: (params: ValueFormatterParams) => (
          <ContractDrawerLauncher
            label={`${formatDateString(
              params.row.data.start_date
            )} - ${formatDateString(params.row.data.adjusted_end_date)}`}
            contractId={params.row.data.id}
          />
        ),
      },
      {
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.Type,
        cellRender: (params: ValueFormatterParams) =>
          ProductTypeToLabel[params.row.data.product_type as ProductTypeEnum],
      },
      {
        dataField: "start_date",
        caption: "Contract Start Date",
        width: ColumnWidths.DateContract,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.start_date} />
        ),
      },
      {
        dataField: "end_date",
        caption: "Contract Expected End Date",
        width: ColumnWidths.DateContract,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.end_date} />
        ),
      },
      {
        dataField: "adjusted_end_date",
        caption: "Contract Termination Date",
        width: ColumnWidths.DateContract,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) =>
          !!params.row.data.terminated_at ? (
            <DateDataGridCell dateString={params.row.data.adjusted_end_date} />
          ) : (
            "TBD"
          ),
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      dataSource={rows}
      columns={columns}
      isExcelExport={isExcelExport}
      pager
    />
  );
}

export default ContractsDataGrid;

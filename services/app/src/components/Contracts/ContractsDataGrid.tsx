import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ContractDrawerLauncher from "components/Contract/ContractDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { ContractFragment, ProductTypeEnum } from "generated/graphql";
import { ProductTypeToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isCompanyVisible?: boolean;
  contracts: ContractFragment[];
}

function ContractsDataGrid({ isCompanyVisible = true, contracts }: Props) {
  const rows = contracts;
  const columns = useMemo(
    () => [
      {
        dataField: "id",
        caption: "Platform ID",
        width: 120,
        cellRender: (params: ValueFormatterParams) => (
          <ContractDrawerLauncher contractId={params.row.data.id} />
        ),
      },
      {
        dataField: "product_type",
        caption: "Product Type",
        cellRender: (params: ValueFormatterParams) =>
          ProductTypeToLabel[params.row.data.product_type as ProductTypeEnum],
      },
      {
        dataField: "start_date",
        caption: "Start Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.start_date} />
        ),
      },
      {
        dataField: "end_date",
        caption: "End Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.end_date} />
        ),
      },
      {
        dataField: "adjusted_end_date",
        caption: "Termination Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.adjusted_end_date} />
        ),
      },
    ],
    []
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid dataSource={rows} columns={columns} pager />
    </Box>
  );
}

export default ContractsDataGrid;

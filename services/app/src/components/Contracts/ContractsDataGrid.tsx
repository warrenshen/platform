import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ContractDrawerLauncher from "components/Contract/ContractDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { ContractFragment } from "generated/graphql";

interface Props {
  isCompanyVisible?: boolean;
  contracts: ContractFragment[];
}

function ContractsDataGrid({ isCompanyVisible = true, contracts }: Props) {
  const rows = contracts;

  const columns = [
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
      alignment: "right",
    },
    {
      dataField: "start_date",
      caption: "Start Date",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.start_date} />
      ),
    },
    {
      dataField: "end_date",
      caption: "End Date",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.end_date} />
      ),
    },
    {
      dataField: "adjusted_end_date",
      caption: "Termination Date",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.adjusted_end_date} />
      ),
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid dataSource={rows} columns={columns} pager />
    </Box>
  );
}

export default ContractsDataGrid;

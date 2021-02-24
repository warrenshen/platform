import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ContractDrawerLauncher from "components/Contract/ContractDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { DataGridActionItem } from "components/Shared/DataGrid/DataGridActionMenu";
import { ContractFragment } from "generated/graphql";

interface Props {
  isCompanyVisible?: boolean;
  contracts: ContractFragment[];
  actionItems?: DataGridActionItem[];
}

function ContractsDataGrid({
  isCompanyVisible = true,
  contracts,
  actionItems = [],
}: Props) {
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
    },
    {
      dataField: "end_date",
      caption: "End Date",
      alignment: "right",
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid dataSource={rows} columns={columns} pager />
    </Box>
  );
}

export default ContractsDataGrid;

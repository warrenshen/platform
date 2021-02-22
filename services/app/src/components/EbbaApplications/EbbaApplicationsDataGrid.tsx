import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import EbbaApplicationDrawerLauncher from "components/EbbaApplication/EbbaApplicationDrawerLauncher";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import { DataGridActionItem } from "components/Shared/DataGrid/DataGridActionMenu";
import { EbbaApplicationsQuery, RequestStatusEnum } from "generated/graphql";
import { truncateUuid } from "lib/uuid";

function populateRows(
  ebbaApplications: EbbaApplicationsQuery["ebba_applications"]
): RowsProp {
  return ebbaApplications.map((ebbaApplication) => ({
    ...ebbaApplication,
    company_name: ebbaApplication.company?.name,
  }));
}

interface Props {
  isCompanyVisible?: boolean;
  ebbaApplications: EbbaApplicationsQuery["ebba_applications"];
  actionItems: DataGridActionItem[];
}

function EbbaApplicationsDataGrid({
  isCompanyVisible = true,
  ebbaApplications,
  actionItems,
}: Props) {
  const rows = populateRows(ebbaApplications);

  const columns = [
    {
      dataField: "id",
      caption: "Platform ID",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <EbbaApplicationDrawerLauncher
          label={truncateUuid(params.row.data.id as string)}
          ebbaApplicationId={params.row.data.id}
        />
      ),
    },
    {
      dataField: "status",
      caption: "Status",
      minWidth: 165,
      alignment: "center",
      cellRender: (params: ValueFormatterParams) => (
        <RequestStatusChip
          requestStatus={params.row.data.status as RequestStatusEnum}
        />
      ),
    },
    {
      visible: isCompanyVisible,
      dataField: "company_name",
      caption: "Company",
    },
    {
      dataField: "application_month",
      caption: "Application Month",
      alignment: "right",
    },
    {
      dataField: "monthly_accounts_receivable",
      caption: "Accounts Receivable",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.monthly_accounts_receivable}
        />
      ),
    },
    {
      dataField: "monthly_inventory",
      caption: "Inventory",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.monthly_inventory} />
      ),
    },
    {
      dataField: "monthly_cash",
      caption: "Cash",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.monthly_cash} />
      ),
    },
    {
      dataField: "calculated_borrowing_base",
      caption: "Calculated Borrowing Base",
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.calculated_borrowing_base}
        />
      ),
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid dataSource={rows} columns={columns} pager />
    </Box>
  );
}

export default EbbaApplicationsDataGrid;

import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import EbbaApplicationDrawerLauncher from "components/Shared/EbbaApplication/EbbaApplicationDrawerLauncher";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
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
  ebbaApplications: EbbaApplicationsQuery["ebba_applications"];
  actionItems: DataGridActionItem[];
}

function EbbaApplicationsDataGrid({ ebbaApplications, actionItems }: Props) {
  const rows = populateRows(ebbaApplications);

  const columns: IColumnProps[] = [
    {
      dataField: "id",
      caption: "Platform ID",
      cellRender: (params: ValueFormatterParams) => (
        <EbbaApplicationDrawerLauncher
          label={truncateUuid(params.row.data.id as string)}
          ebbaApplicationId={params.row.data.id}
        ></EbbaApplicationDrawerLauncher>
      ),
    },
    {
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
      caption: "Monthly AR",
      alignment: "right",
    },
    {
      dataField: "monthly_inventory",
      caption: "Monthly Inventory",
      alignment: "right",
    },
    {
      dataField: "monthly_cash",
      caption: "Monthly Cash",
      alignment: "right",
    },
    {
      dataField: "status",
      caption: "Status",
      minWidth: 175,
      alignment: "center",
      cellRender: (params: ValueFormatterParams) => (
        <RequestStatusChip requestStatus={params.value as RequestStatusEnum} />
      ),
    },
    {
      dataField: "action",
      caption: "Action",
      alignment: "center",
      minWidth: 100,
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu
          params={params}
          actionItems={actionItems}
        ></DataGridActionMenu>
      ),
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <DataGrid height={"100%"} wordWrapEnabled={true} dataSource={rows}>
        {columns.map(
          ({
            dataField,
            minWidth,
            caption,
            visible,
            alignment,
            cellRender,
          }) => (
            <Column
              key={caption}
              caption={caption}
              dataField={dataField}
              alignment={alignment}
              minWidth={minWidth}
              visible={visible}
              cellRender={cellRender}
            />
          )
        )}
        <Paging defaultPageSize={50} />
        <Pager
          visible={true}
          showPageSizeSelector={true}
          allowedPageSizes={[10, 20, 50]}
          showInfo={true}
        />
      </DataGrid>
    </Box>
  );
}

export default EbbaApplicationsDataGrid;

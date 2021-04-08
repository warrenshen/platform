import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import EbbaApplicationDrawerLauncher from "components/EbbaApplication/EbbaApplicationDrawerLauncher";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import {
  GetOpenEbbaApplicationsQuery,
  RequestStatusEnum,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  ebbaApplications: GetOpenEbbaApplicationsQuery["ebba_applications"];
}

function EbbaApplicationsDataGrid({
  isCompanyVisible = true,
  isExcelExport = false,
  ebbaApplications,
}: Props) {
  const rows = useMemo(
    () =>
      ebbaApplications.map((ebbaApplication) => ({
        ...ebbaApplication,
        company_name: ebbaApplication.company?.name,
      })),
    [ebbaApplications]
  );
  const columns = useMemo(
    () => [
      {
        dataField: "id",
        caption: "Platform ID",
        width: 120,
        cellRender: (params: ValueFormatterParams) => (
          <EbbaApplicationDrawerLauncher
            ebbaApplicationId={params.row.data.id}
          />
        ),
      },
      {
        dataField: "status",
        caption: "Status",
        width: ColumnWidths.Status,
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
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "application_date",
        caption: "Application Date",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "monthly_accounts_receivable",
        caption: "Accounts Receivable",
        width: ColumnWidths.Currency,
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
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.monthly_inventory} />
        ),
      },
      {
        dataField: "monthly_cash",
        caption: "Cash in Deposit Accounts",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.monthly_cash} />
        ),
      },
      {
        dataField: "amount_cash_in_daca",
        caption: "Cash in DACA Deposit Accounts",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount_cash_in_daca} />
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
    ],
    [isCompanyVisible]
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager
        dataSource={rows}
        columns={columns}
        isExcelExport={isExcelExport}
      />
    </Box>
  );
}

export default EbbaApplicationsDataGrid;

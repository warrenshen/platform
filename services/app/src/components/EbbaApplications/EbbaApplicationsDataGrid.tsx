import { ValueFormatterParams } from "@material-ui/data-grid";
import EbbaApplicationDrawerLauncher from "components/EbbaApplication/EbbaApplicationDrawerLauncher";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  EbbaApplicationFragment,
  EbbaApplications,
  GetOpenEbbaApplicationsQuery,
  RequestStatusEnum,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  ebbaApplications: GetOpenEbbaApplicationsQuery["ebba_applications"];
  selectedEbbaApplicationIds?: EbbaApplications["id"][];
  handleSelectEbbaApplications?: (
    ebbaApplications: EbbaApplicationFragment[]
  ) => void;
}

export default function EbbaApplicationsDataGrid({
  isCompanyVisible = true,
  isExcelExport = true,
  isMultiSelectEnabled = false,
  ebbaApplications,
  selectedEbbaApplicationIds,
  handleSelectEbbaApplications,
}: Props) {
  const rows = useMemo(
    () =>
      ebbaApplications.map((ebbaApplication) => ({
        ...ebbaApplication,
        company_name: ebbaApplication.company?.name,
        submitted_by_name: ebbaApplication.submitted_by_user?.full_name,
      })),
    [ebbaApplications]
  );
  const columns = useMemo(
    () => [
      {
        dataField: "id",
        caption: "Platform ID",
        width: ColumnWidths.Identifier,
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
        dataField: "submitted_by_name",
        caption: "Submitted By",
        minWidth: ColumnWidths.MinWidth,
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
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.application_date} />
        ),
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

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectEbbaApplications &&
      handleSelectEbbaApplications(
        selectedRowsData as EbbaApplicationFragment[]
      ),
    [handleSelectEbbaApplications]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      select={isMultiSelectEnabled}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedEbbaApplicationIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}

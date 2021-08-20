import { ValueFormatterParams } from "@material-ui/data-grid";
import EbbaApplicationDrawer from "components/EbbaApplication/EbbaApplicationDrawer";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import {
  EbbaApplicationFragment,
  EbbaApplications,
  GetOpenEbbaApplicationsByCategoryQuery,
  RequestStatusEnum,
} from "generated/graphql";
import { ClientSurveillanceCategoryEnum } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";

interface Props {
  isApprovedAtVisible?: boolean;
  isBorrowingBaseFieldsVisible?: boolean;
  isCategoryVisible?: boolean;
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  ebbaApplications: GetOpenEbbaApplicationsByCategoryQuery["ebba_applications"];
  selectedEbbaApplicationIds?: EbbaApplications["id"][];
  handleSelectEbbaApplications?: (
    ebbaApplications: EbbaApplicationFragment[]
  ) => void;
}

export default function EbbaApplicationsDataGrid({
  isApprovedAtVisible = false,
  isBorrowingBaseFieldsVisible = false,
  isCategoryVisible = false,
  isCompanyVisible = false,
  isExcelExport = true,
  isMultiSelectEnabled = false,
  ebbaApplications,
  selectedEbbaApplicationIds,
  handleSelectEbbaApplications,
}: Props) {
  const [selectedEbbaApplicationId, setSelectedEbbaApplicationId] = useState<
    EbbaApplications["id"] | null
  >(null);

  const rows = useMemo(
    () =>
      ebbaApplications.map((ebbaApplication) => ({
        ...ebbaApplication,
        category:
          ebbaApplication.category ===
          ClientSurveillanceCategoryEnum.BorrowingBase
            ? "Borrowing Base"
            : "Financial Reports",
        company_name: ebbaApplication.company?.name,
        expiration_date: ebbaApplication.expires_at,
        files_count: ebbaApplication.ebba_application_files.length,
        submitted_by_name: ebbaApplication.submitted_by_user?.full_name,
      })),
    [ebbaApplications]
  );
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "id",
        caption: "",
        width: ColumnWidths.Open,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            onClick={() => setSelectedEbbaApplicationId(params.row.data.id)}
            label={"OPEN"}
          />
        ),
      },
      {
        visible: isCompanyVisible,
        dataField: "company_name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            url={getBankCompanyRoute(
              params.row.data.company_id,
              BankCompanyRouteEnum.EbbaApplications
            )}
            label={params.row.data.company_name}
          />
        ),
      },
      {
        visible: isCategoryVisible,
        dataField: "category",
        caption: "Certification Type",
        width: ColumnWidths.Status,
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
        visible: isApprovedAtVisible,
        dataField: "approved_at",
        caption: "Approved At",
        width: ColumnWidths.Datetime,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.approved_at}
          />
        ),
      },
      {
        dataField: "submitted_by_name",
        caption: "Submitted By",
        width: ColumnWidths.UserName,
      },
      {
        dataField: "application_date",
        caption: "Certification Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.application_date} />
        ),
      },
      {
        dataField: "expiration_date",
        caption: "Expiration Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.expiration_date} />
        ),
      },
      {
        dataField: "files_count",
        caption: "# File Attachments",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isBorrowingBaseFieldsVisible,
        dataField: "monthly_accounts_receivable",
        caption: "Accounts Receivable Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.monthly_accounts_receivable}
          />
        ),
      },
      {
        visible: isBorrowingBaseFieldsVisible,
        dataField: "monthly_inventory",
        caption: "Inventory",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.monthly_inventory} />
        ),
      },
      {
        visible: isBorrowingBaseFieldsVisible,
        dataField: "monthly_cash",
        caption: "Cash in Deposit Accounts",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.monthly_cash} />
        ),
      },
      {
        visible: isBorrowingBaseFieldsVisible,
        dataField: "amount_cash_in_daca",
        caption: "Cash in DACA Deposit Accounts",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount_cash_in_daca} />
        ),
      },
      {
        visible: isBorrowingBaseFieldsVisible,
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
    [
      isApprovedAtVisible,
      isCategoryVisible,
      isCompanyVisible,
      isBorrowingBaseFieldsVisible,
    ]
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
    <>
      {!!selectedEbbaApplicationId && (
        <EbbaApplicationDrawer
          ebbaApplicationId={selectedEbbaApplicationId}
          handleClose={() => setSelectedEbbaApplicationId(null)}
        />
      )}
      <ControlledDataGrid
        isExcelExport={isExcelExport}
        pager
        select={isMultiSelectEnabled}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedEbbaApplicationIds}
        onSelectionChanged={handleSelectionChanged}
      />
    </>
  );
}

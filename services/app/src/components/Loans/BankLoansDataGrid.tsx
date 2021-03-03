import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import { FilterList } from "@material-ui/icons";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  LoanFragment,
  Loans,
  LoanStatusEnum,
  LoanTypeEnum,
  RequestStatusEnum,
} from "generated/graphql";
import { AllLoanStatuses, LoanTypeToLabel } from "lib/enum";
import { createLoanPublicIdentifier } from "lib/loans";
import { ColumnWidths } from "lib/tables";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  isMaturityVisible: boolean;
  isMultiSelectEnabled?: boolean;
  fullView: boolean;
  loansPastDue: boolean;
  matureDays?: number;
  filterByStatus?: RequestStatusEnum;
  loans: LoanFragment[];
  actionItems?: DataGridActionItem[];
  selectedLoanIds?: Loans["id"][];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

const getMaturityDate = (rowData: any) => new Date(rowData.maturity_date);

function BankLoansDataGrid({
  isMaturityVisible,
  isMultiSelectEnabled,
  fullView,
  loansPastDue,
  matureDays = 0,
  filterByStatus,
  loans,
  actionItems,
  selectedLoanIds,
  handleSelectLoans,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = loans;

  useEffect(() => {
    if (!dataGrid) return;
    dataGrid.instance.clearFilter(getMaturityDate);
    if (loansPastDue)
      dataGrid.instance.filter([getMaturityDate, "<", new Date(Date.now())]);
    if (matureDays > 0)
      dataGrid.instance.filter([
        [getMaturityDate, ">", new Date(Date.now())],
        "and",
        [
          getMaturityDate,
          "<",
          new Date(
            new Date(Date.now()).getTime() + matureDays * 24 * 60 * 60 * 1000
          ),
        ],
      ]);
    if (filterByStatus) {
      dataGrid.instance.filter(["status", "=", filterByStatus]);
    }
  }, [dataGrid, filterByStatus, loansPastDue, matureDays]);

  const maturingInDaysRenderer = (value: any) => {
    const maturityTime = getMaturityDate(value.data).getTime();
    const nowTime = new Date(Date.now()).getTime();
    return Math.floor((maturityTime - nowTime) / (24 * 60 * 60 * 1000));
  };

  const daysPastDueRenderer = (value: any) => {
    const maturityTime = getMaturityDate(value.data).getTime();
    const nowTime = new Date(Date.now()).getTime();
    return Math.floor((nowTime - maturityTime) / (24 * 60 * 60 * 1000));
  };

  const columns = useMemo(
    () => [
      {
        dataField: "id",
        caption: "Identifier",
        width: 120,
        cellRender: (params: ValueFormatterParams) => (
          <LoanDrawerLauncher
            label={createLoanPublicIdentifier(params.row.data as LoanFragment)}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        visible: !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        alignment: "center",
        width: 100,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        dataField: "status",
        caption: "Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <LoanStatusChip loanStatus={params.value as LoanStatusEnum} />
        ),
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: AllLoanStatuses.map((d) => ({
                status: d,
              })),
              key: "status",
            },
          },
          valueExpr: "status",
          displayExpr: "status",
        },
      },
      {
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Box display="flex" alignItems="center">
            <Link to={`/customers/${params.row.data.company.id}/loans`}>
              <Box display="flex" alignItems="center" mr={1}>
                <FilterList />
              </Box>
            </Link>
            <Box>{params.row.data.company.name as string}</Box>
          </Box>
        ),
      },
      {
        caption: "Loan Type",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Box>
            {LoanTypeToLabel[params.row.data.loan_type as LoanTypeEnum]}
          </Box>
        ),
      },
      {
        caption: "Loan Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        caption: "Requested Payment Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.requested_payment_date}
          />
        ),
      },
      {
        visible: isMaturityVisible,
        caption: "Maturity Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.maturity_date} />
        ),
      },
      {
        visible: isMaturityVisible,
        caption: "Maturing in (Days)",
        width: 150,
        alignment: "right",
        cellRender: maturingInDaysRenderer,
      },
      {
        visible: loansPastDue,
        dataField: "outstanding_interest",
        caption: "Interest Accrued",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: loansPastDue,
        dataField: "outstanding_fees",
        caption: "Late Fees Accrued",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        visible: loansPastDue,
        caption: "Days Past Due",
        width: 130,
        alignment: "center",
        cellRender: daysPastDueRenderer,
      },
    ],
    [isMaturityVisible, loansPastDue, actionItems]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectLoans &&
      handleSelectLoans(selectedRowsData as LoanFragment[]),
    [handleSelectLoans]
  );

  const allowedPageSizes = useMemo(() => [5, 50], []);
  const filtering = useMemo(() => ({ enable: fullView }), [fullView]);

  return (
    <ControlledDataGrid
      ref={(ref) => setDataGrid(ref)}
      filtering={filtering}
      pager={fullView}
      select={isMultiSelectEnabled}
      pageSize={fullView ? 50 : 5}
      allowedPageSizes={allowedPageSizes}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedLoanIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}

export default BankLoansDataGrid;

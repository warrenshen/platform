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
import { IColumnProps } from "devextreme-react/data-grid";
import {
  LoanFragment,
  Loans,
  LoanStatusEnum,
  LoanTypeEnum,
  RequestStatusEnum,
} from "generated/graphql";
import { AllLoanStatuses, LoanTypeToLabel } from "lib/enum";
import { createLoanPublicIdentifier } from "lib/loans";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  isMaturityVisible: boolean;
  fullView: boolean;
  loansPastDue: boolean;
  matureDays?: number;
  filterByStatus?: RequestStatusEnum;
  loans: LoanFragment[];
  selectedLoanIds?: Loans["id"][];
  actionItems?: DataGridActionItem[];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

const getMaturityDate = (rowData: any) => new Date(rowData.maturity_date);

function BankLoansDataGrid({
  isMaturityVisible,
  fullView,
  loansPastDue,
  matureDays = 0,
  filterByStatus,
  loans,
  selectedLoanIds = [],
  actionItems = [],
  handleSelectLoans = () => {},
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

  const columns: IColumnProps[] = [
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
      dataField: "status",
      caption: "Status",
      width: 150,
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
      width: 190,
      cellRender: (params: ValueFormatterParams) => (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>{params.row.data.company.name as string}</Box>
          <Box ml={0.5}>
            <Link to={`/customers/${params.row.data.company.id}/loans`}>
              <FilterList />
            </Link>
          </Box>
        </Box>
      ),
    },
    {
      caption: "Loan Type",
      width: 190,
      cellRender: (params: ValueFormatterParams) => (
        <Box>{LoanTypeToLabel[params.row.data.loan_type as LoanTypeEnum]}</Box>
      ),
    },
    {
      caption: "Loan Amount",
      alignment: "right",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.amount} />
      ),
    },
    {
      caption: "Requested Payment Date",
      alignment: "right",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.requested_payment_date} />
      ),
    },
    {
      visible: isMaturityVisible,
      caption: "Maturity Date",
      alignment: "center",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.maturity_date} />
      ),
    },
    {
      visible: isMaturityVisible,
      caption: "Maturing in (Days)",
      width: 150,
      alignment: "center",
      cellRender: maturingInDaysRenderer,
    },
    {
      visible: loansPastDue,
      dataField: "outstanding_interest",
      caption: "Interest Accrued",
      alignment: "center",
      width: 140,
    },
    {
      visible: loansPastDue,
      dataField: "outstanding_fees",
      caption: "Late Fees Accrued",
      alignment: "center",
      width: 150,
    },
    {
      visible: loansPastDue,
      caption: "Days Past Due",
      width: 130,
      alignment: "center",
      cellRender: daysPastDueRenderer,
    },
    {
      visible: actionItems.length > 0,
      dataField: "action",
      caption: "Action",
      alignment: "center",
      width: 100,
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu params={params} actionItems={actionItems} />
      ),
    },
  ];

  return (
    <ControlledDataGrid
      ref={(ref) => setDataGrid(ref)}
      filtering={{ enable: fullView }}
      pager={fullView}
      select
      pageSize={fullView ? 50 : 5}
      allowedPageSizes={[5, 50]}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedLoanIds}
      onSelectionChanged={({ selectedRowsData }: any) =>
        handleSelectLoans(selectedRowsData as LoanFragment[])
      }
    />
  );
}

export default BankLoansDataGrid;

import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import LoanDrawerLauncher from "components/Shared/Loan/LoanDrawerLauncher";
import { IColumnProps } from "devextreme-react/data-grid";
import {
  LoanFragment,
  LoanStatusEnum,
  LoanTypeEnum,
  RequestStatusEnum,
} from "generated/graphql";
import { AllLoanStatuses, LoanTypeToLabel } from "lib/enum";
import { truncateUuid } from "lib/uuid";
import { useEffect, useState } from "react";

interface Props {
  fullView: boolean;
  loansPastDue: boolean;
  matureDays?: number | null;
  filterByStatus?: RequestStatusEnum;
  loans: LoanFragment[];
  actionItems?: DataGridActionItem[];
}

const getMaturityDate = (rowData: any) => new Date(rowData.maturity_date);

function BankLoansDataGrid({
  fullView,
  loansPastDue,
  matureDays,
  filterByStatus,
  loans,
  actionItems = [],
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = loans;

  useEffect(() => {
    if (!dataGrid) return;
    dataGrid.instance.clearFilter(getMaturityDate);
    if (loansPastDue)
      dataGrid.instance.filter([getMaturityDate, "<", new Date(Date.now())]);
    if (matureDays && matureDays > 0)
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
      caption: "Platform ID",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <LoanDrawerLauncher
          label={truncateUuid(params.row.data.id as string)}
          loanId={params.row.data.id as string}
        ></LoanDrawerLauncher>
      ),
    },
    {
      dataField: "status",
      caption: "Status",
      width: 150,
      alignment: "center",
      cellRender: (params: ValueFormatterParams) => (
        <LoanStatusChip
          loanStatus={params.value as LoanStatusEnum}
        ></LoanStatusChip>
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
    },
    {
      caption: "Loan Type",
      width: 190,
      cellRender: (params: ValueFormatterParams) => (
        <Box>{LoanTypeToLabel[params.row.data.loan_type as LoanTypeEnum]}</Box>
      ),
    },
    {
      dataField: "purchase_order.vendor.name",
      caption: "Vendor Name",
      width: 190,
    },
  ];

  if (matureDays && matureDays > 0) {
    columns.push({
      caption: "Loan Date",
      alignment: "center",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell
          dateString={params.row.data.origination_date}
        ></DateDataGridCell>
      ),
    });
  }
  columns.push({
    caption: "Loan Amount",
    alignment: "right",
    width: 120,
    cellRender: (params: ValueFormatterParams) => (
      <CurrencyDataGridCell
        value={params.row.data.amount}
      ></CurrencyDataGridCell>
    ),
  });

  if (loansPastDue) {
    columns.push({
      dataField: "outstanding_interest",
      caption: "Interest Accrued",
      alignment: "center",
      width: 140,
    });
    columns.push({
      dataField: "outstanding_fees",
      caption: "Late Fees Accrued",
      alignment: "center",
      width: 150,
    });
  }

  columns.push({
    caption: "Maturity Date",
    alignment: "center",
    width: 120,
    cellRender: (params: ValueFormatterParams) => (
      <DateDataGridCell
        dateString={params.row.data.maturity_date}
      ></DateDataGridCell>
    ),
  });

  if (loansPastDue) {
    columns.push({
      caption: "Days Past Due",
      width: 130,
      alignment: "center",
      cellRender: daysPastDueRenderer,
    });
  } else {
    columns.push({
      caption: "Maturing in (Days)",
      width: 150,
      alignment: "center",
      cellRender: maturingInDaysRenderer,
    });
  }

  if (actionItems.length > 0) {
    columns.push({
      dataField: "action",
      caption: "Action",
      alignment: "center",
      width: 100,
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu
          params={params}
          actionItems={actionItems}
        ></DataGridActionMenu>
      ),
    });
  }

  return (
    <ControlledDataGrid
      dataSource={rows}
      columns={columns}
      filtering={fullView}
      pager={fullView}
      pageSize={fullView ? 50 : 5}
      allowedPageSizes={[5, 50]}
      ref={(ref) => setDataGrid(ref)}
    ></ControlledDataGrid>
  );
}

export default BankLoansDataGrid;

import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import Status from "components/Shared/Chip/Status";
import ActionMenu from "components/Shared/DataGrid/ActionMenu";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import DataGrid, {
  Column,
  FilterRow,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import {
  LoanFragment,
  LoanTypeEnum,
  RequestStatusEnum,
} from "generated/graphql";
import { LoanTypeToLabel, AllLoanStatuses } from "lib/enum";
import { useEffect, useState } from "react";

interface Props {
  loans: LoanFragment[];
  fullView: boolean;
  loansPastDue: boolean;
  matureDays?: number | null;
  filterByStatus?: RequestStatusEnum;
}

const getMaturityDate = (rowData: any) => new Date(rowData.maturity_date);

function BankLoansDataGrid({
  loans,
  fullView,
  loansPastDue,
  matureDays,
  filterByStatus,
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

  const statusCellRenderer = (params: ValueFormatterParams) => (
    <Status statusValue={params.value} />
  );

  const actionCellRenderer = (params: ValueFormatterParams) => (
    <ActionMenu
      actionItems={[
        {
          key: "edit-purchase-order-loan",
          label: "Edit",
          handleClick: () => {},
        },
      ]}
    ></ActionMenu>
  );

  const columns: IColumnProps[] = [
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
    {
      dataField: "id",
      caption: "Loan ID",
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

  columns.push({
    dataField: "status",
    caption: "Status",
    width: 150,
    alignment: "center",
    cellRender: statusCellRenderer,
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

  columns.push({
    dataField: "action",
    caption: "Action",
    alignment: "center",
    width: 100,
    cellRender: actionCellRenderer,
  });

  return (
    <DataGrid
      height={"100%"}
      width={"100%"}
      dataSource={rows}
      ref={(ref) => setDataGrid(ref)}
    >
      <FilterRow visible={fullView} />
      {columns.map(
        ({ dataField, caption, width, alignment, cellRender, lookup }, i) => (
          <Column
            key={`${dataField}-${i}`}
            caption={caption}
            dataField={dataField}
            width={width}
            alignment={alignment}
            cellRender={cellRender}
            lookup={lookup}
          />
        )
      )}
      <Paging pageSize={fullView ? 50 : 5} />
      <Pager visible={fullView} allowedPageSizes={[5, 50]} />
    </DataGrid>
  );
}

export default BankLoansDataGrid;

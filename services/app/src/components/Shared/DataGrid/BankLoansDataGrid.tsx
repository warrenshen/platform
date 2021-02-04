import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import Status from "components/Shared/Chip/Status";
import ActionMenu from "components/Shared/DataGrid/ActionMenu";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGrid, {
  Column,
  FilterRow,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import { LoanFragment, RequestStatusEnum } from "generated/graphql";
import { useEffect, useState } from "react";

function getRows(purchaseOrderLoans: LoanFragment[]): RowsProp {
  return purchaseOrderLoans.map((item) => ({
    ...item,
  }));
}

interface Props {
  purchaseOrderLoans: LoanFragment[];
  fullView: boolean;
  loansPastDue: boolean;
  matureDays?: number | null;
  filterByStatus?: RequestStatusEnum;
}

const getMaturityDate = (rowData: any) => new Date(rowData.maturity_date);

function BankLoansDataGrid({
  purchaseOrderLoans,
  fullView,
  loansPastDue,
  matureDays,
  filterByStatus,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = getRows(purchaseOrderLoans);

  useEffect(() => {
    if (!dataGrid) return;
    dataGrid.instance.clearFilter(getMaturityDate);
    // TODO: add status check
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

  const renderAmount = (params: ValueFormatterParams) => (
    <CurrencyDataGridCell value={params.row.data.amount}></CurrencyDataGridCell>
  );

  const statusCellRenderer = (params: ValueFormatterParams) => (
    <Status statusValue={params.value} />
  );

  const actionCellRenderer = (params: ValueFormatterParams) => (
    <ActionMenu
      actionItems={[
        {
          key: "edit-purchase-order-loan",
          label: "Edit",
          // TODO: add handleEditPurchaseOrderLoan function as a prop
          handleClick: () => {},
        },
      ]}
    ></ActionMenu>
  );

  const columns: IColumnProps[] = [
    // {
    //   dataField: "purchase_order.order_number",
    //   caption: "Order Number",
    //   width: 130,
    //   cellRender: purchaseOrderNumberRenderer,
    // },
    {
      dataField: "purchase_order.company.name",
      caption: "Customer Name",
      width: 190,
    },
    {
      dataField: "purchase_order.vendor.name",
      caption: "Vendor Name",
      width: 190,
    },
    // {
    //   dataField: "requested_at",
    //   caption: "Requested At",
    //   width: 130,
    // },
    {
      dataField: "id",
      caption: "Loan ID",
      width: 190,
    },
  ];

  if (matureDays && matureDays > 0) {
    columns.push({
      dataField: "origination_date",
      caption: "Loan Date",
      alignment: "center",
      width: 140,
    });
  }
  columns.push({
    caption: "Loan Amount",
    width: 120,
    cellRender: renderAmount,
  });

  // {
  //   dataField: "?",
  //   caption: "Loan Balance",
  //   width: 120,
  // },

  columns.push({
    dataField: "status",
    caption: "Status",
    width: 120,
    alignment: "center",
    cellRender: statusCellRenderer,
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
    dataField: "maturity_date",
    caption: "Maturity Date",
    alignment: "center",
    width: 120,
  });

  if (loansPastDue) {
    columns.push({
      caption: "Days Past Due",
      width: 130,
      alignment: "center",
      cellRender: daysPastDueRenderer,
    });
    // columns.push({
    //   dataField: "?",
    //   caption: "Restricted Date",
    //   width: 120,
    // });
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
        ({ dataField, caption, width, alignment, cellRender }, i) => (
          <Column
            key={`${dataField}-${i}`}
            caption={caption}
            dataField={dataField}
            width={width}
            alignment={alignment}
            cellRender={cellRender}
          />
        )
      )}
      <Paging pageSize={fullView ? 50 : 5} />
      <Pager visible={fullView} allowedPageSizes={[5, 50]} />
    </DataGrid>
  );
}

export default BankLoansDataGrid;

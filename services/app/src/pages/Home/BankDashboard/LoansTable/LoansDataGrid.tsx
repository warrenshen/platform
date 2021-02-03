import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import Status from "components/Shared/Chip/Status";
import ActionMenu from "components/Shared/DataGrid/ActionMenu";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import { LoanFragment, Maybe } from "generated/graphql";
import { useEffect, useState } from "react";
import PurchaseOrderNumberCell from "./PurchaseOrderNumberCell";

function getRows(purchaseOrderLoans: Maybe<LoanFragment[]>): RowsProp {
  return purchaseOrderLoans
    ? purchaseOrderLoans.map((item) => {
        return {
          ...item,
        };
      })
    : [];
}

interface Props {
  purchaseOrderLoans: LoanFragment[];
  fullView: boolean;
  loansPastDue: boolean;
  matureDays: number | null;
  customerSearchQuery: string;
  onClickCustomerName: (value: string) => void;
}

const getMaturityDate = (rowData: any) => new Date(rowData.maturity_date);

function LoansDataGrid({
  purchaseOrderLoans,
  fullView,
  loansPastDue,
  matureDays,
  customerSearchQuery,
  onClickCustomerName,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = getRows(purchaseOrderLoans);

  useEffect(() => {
    if (!dataGrid) return;
    dataGrid.instance.clearFilter();
    // TODO: add status check
    if (loansPastDue)
      dataGrid.instance.filter([getMaturityDate, "<", new Date(Date.now())]);
    if (matureDays && matureDays > 0)
      dataGrid?.instance?.filter([
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
  }, [dataGrid, loansPastDue, matureDays]);

  useEffect(() => {
    if (!dataGrid) return;
    if (customerSearchQuery) {
      dataGrid.instance.filter([
        "purchase_order.company.name",
        "contains",
        customerSearchQuery,
      ]);
    } else {
      dataGrid.instance.clearFilter();
    }
  }, [dataGrid, customerSearchQuery]);

  const purchaseOrderNumberRenderer = (params: ValueFormatterParams) => (
    <PurchaseOrderNumberCell
      purchaseOrderLoanId={params.row.data.id}
      purchaseOrderNumber={params.row.data.purchase_order.order_number}
    />
  );

  const companyNameRenderer = (params: ValueFormatterParams) => {
    return (
      <ClickableDataGridCell
        label={params.row.data.purchase_order.company.name}
        onClick={() => {
          onClickCustomerName(params.row.data.purchase_order.company.name);
          dataGrid?.instance.filter([
            "purchase_order.company.name",
            "=",
            params.row.data.purchase_order.company.name,
          ]);
        }}
      />
    );
  };

  const vendorNameRenderer = (params: ValueFormatterParams) => {
    return (
      <ClickableDataGridCell
        label={params.row.data.purchase_order.vendor.name}
        onClick={() => {
          dataGrid?.instance.filter([
            "purchase_order.vendor.name",
            "=",
            params.row.data.purchase_order.vendor.name,
          ]);
        }}
      />
    );
  };

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
          // TODO: add handleEditPurchaseOrderLoan function as a prop
          handleClick: () => {},
        },
      ]}
    ></ActionMenu>
  );

  const columns: IColumnProps[] = [
    {
      dataField: "purchase_order.order_number",
      caption: "Order Number",
      width: 130,
      cellRender: purchaseOrderNumberRenderer,
    },
    {
      dataField: "purchase_order.company.name",
      caption: "Customer Name",
      width: 190,
      cellRender: companyNameRenderer,
    },
    {
      dataField: "purchase_order.vendor.name",
      caption: "Vendor Name",
      width: 190,
      cellRender: vendorNameRenderer,
    },
    {
      dataField: "requested_at",
      caption: "Requested At",
      width: 130,
    },
    {
      dataField: "purchase_order.amount",
      caption: "Order Amount",
      width: 120,
    },
    {
      dataField: "amount",
      caption: "Loan Amount",
      width: 120,
    },
    {
      dataField: "status",
      caption: "Status",
      width: 120,
      alignment: "center",
      cellRender: statusCellRenderer,
    },
    {
      dataField: "outstanding_interest",
      caption: "Interest Accrued",
      alignment: "center",
      width: 140,
    },
    {
      dataField: "maturity_date",
      caption: "Maturity Date",
      alignment: "center",
      width: 120,
    },
  ];

  if (loansPastDue) {
    columns.push({
      dataField: "outstanding_fees",
      caption: "Late Fees Accrued",
      alignment: "center",
      width: 150,
    });
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
      <Paging pageSize={fullView ? 30 : 5} />
      <Pager visible={fullView} allowedPageSizes={[5, 30]} />
    </DataGrid>
  );
}

export default LoansDataGrid;

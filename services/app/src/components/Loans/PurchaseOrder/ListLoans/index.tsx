import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import Launcher from "components/Shared/PurchaseOrderLoanDrawer/Launcher";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import {
  Maybe,
  PurchaseOrderLoanFragment,
  useListPurchaseOrderLoansForCustomerQuery,
} from "generated/graphql";
import useCompanyContext from "hooks/useCompanyContext";
import React from "react";

function getRows(poLoans: Maybe<PurchaseOrderLoanFragment[]>): RowsProp {
  return poLoans
    ? poLoans.map((item) => {
        return {
          ...item,
        };
      })
    : [];
}

function ListLoans() {
  const companyId = useCompanyContext();
  const { data: poLoansData } = useListPurchaseOrderLoansForCustomerQuery({
    variables: {
      companyId,
    },
  });

  const purchaseOrderRenderer = (params: ValueFormatterParams) => {
    const purchaseOrderLoanId = params.row.data.id as string;
    return <Launcher purchaseOrderLoanId={purchaseOrderLoanId}></Launcher>;
  };

  const columns: IColumnProps[] = [
    {
      dataField: "purchase_order_id",
      caption: "Purchase Order",
      cellRender: purchaseOrderRenderer,
      width: 150,
    },
    {
      dataField: "amount",
      caption: "Amount",
      width: 150,
    },
    {
      dataField: "amount_owed",
      caption: "Amount Owed",
      width: 150,
    },
    {
      dataField: "adjusted_maturity_date",
      caption: "Maturity Date",
      width: 200,
    },
    {
      dataField: "outstanding_principal_balance",
      caption: "Outstanding Principal Balance",
      width: 220,
    },
    {
      dataField: "status",
      caption: "Status",
      width: 150,
    },
  ];

  const rows = getRows(poLoansData ? poLoansData.purchase_order_loans : []);

  return (
    <div style={{ minHeight: "500px", width: "100%" }}>
      <DataGrid height={"100%"} width={"100%"} dataSource={rows}>
        {columns.map(({ dataField, width, caption, cellRender }) => (
          <Column
            key={dataField}
            caption={caption}
            dataField={dataField}
            width={width}
            cellRender={cellRender}
          />
        ))}
        <Paging defaultPageSize={50} />
        <Pager
          visible={true}
          showPageSizeSelector={true}
          allowedPageSizes={[10, 20, 50]}
          showInfo={true}
        />
      </DataGrid>
    </div>
  );
}
export default ListLoans;

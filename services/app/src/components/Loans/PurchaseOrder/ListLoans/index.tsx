import {
  ColDef,
  DataGrid,
  RowsProp,
  ValueFormatterParams,
} from "@material-ui/data-grid";
import Launcher from "components/Shared/PurchaseOrderLoanDrawer/Launcher";
import {
  Maybe,
  PurchaseOrderLoanFragment,
  useListPurchaseOrderLoansForCustomerQuery,
} from "generated/graphql";
import useCompanyContext from "hooks/useCustomerContext";
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

  const columns: ColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 200,
    },
    {
      field: "status",
      headerName: "Status",
      width: 200,
    },
    {
      field: "origination_date",
      headerName: "Origination Date",
      width: 200,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 200,
    },
    {
      field: "see_more",
      headerName: "See More",
      width: 100,
      renderCell: (params: ValueFormatterParams) => {
        const purchaseOrderLoanId = params.row.id as string;
        return <Launcher purchaseOrderLoanId={purchaseOrderLoanId}></Launcher>;
      },
    },
  ];

  const rows = getRows(poLoansData ? poLoansData.purchase_order_loans : []);

  return (
    <div style={{ minHeight: "500px", width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </div>
  );
}
export default ListLoans;

import { ColDef, DataGrid, RowsProp } from "@material-ui/data-grid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Maybe,
  PurchaseOrderLoanForCustomerFragment,
  useListPurchaseOrderLoansForCustomerQuery,
} from "generated/graphql";
import React, { useContext } from "react";

function getRows(
  poLoans: Maybe<PurchaseOrderLoanForCustomerFragment[]>
): RowsProp {
  return poLoans
    ? poLoans.map((item) => {
        return {
          ...item,
        };
      })
    : [];
}

function ListLoans() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data: poLoansData } = useListPurchaseOrderLoansForCustomerQuery({
    variables: {
      companyId,
    },
  });

  const columns: ColDef[] = [
    {
      field: "id",
      headerName: "Loan ID",
      width: 200,
    },
    {
      field: "amount",
      headerName: "Loan Amount",
      width: 200,
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
    },
  ];

  const rows = getRows(poLoansData ? poLoansData.purchase_order_loans : []);

  return (
    <div style={{ minHeight: "300px", width: "100%" }}>
      <h2>Purchase Order Loans</h2>
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

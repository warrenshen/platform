import { PurchaseOrderLoans } from "generated/graphql";

function Disbursements(props: { id: PurchaseOrderLoans["id"] }) {
  return null;
  /*
  const { data } = usePurchaseOrderLoanDisbursementsQuery({
    variables: {
      id: props.id,
    },
  });

  if (!data || !data.purchase_order_loans_by_pk) {
    return null;
  }

  /*
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>Vendor</TableCell>
            <TableCell>Submitted</TableCell>
            <TableCell>Settled</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.purchase_order_loans_by_pk.transactions
            .map(
              (purchaseOrderLoanPayment) => purchaseOrderLoanPayment.transaction
            )
            .map((transaction) => {
              return (
                <TableRow>
                  <TableCell>
                    ${Intl.NumberFormat("en-US").format(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.company?.name}</TableCell>
                  <TableCell>
                    {calendarDateTimestamp(transaction.submitted_at)}
                  </TableCell>
                  <TableCell>
                    {calendarDateTimestamp(transaction.settled_at)}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
  */
}

export default Disbursements;

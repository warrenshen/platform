import { Box } from "@material-ui/core";
import { useApprovedPurchaseOrderLoansQuery } from "generated/graphql";
import useCompanyContext from "hooks/useCustomerContext";

interface Props {
  amount: number;
}

function RepaymentCoverage(props: Props) {
  const companyId = useCompanyContext();
  const { data } = useApprovedPurchaseOrderLoansQuery({
    variables: {
      companyId: companyId,
    },
  });

  if (!data || !data.purchase_order_loans) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box>Number selected: {props.amount}</Box>
      <Box>
        {data.purchase_order_loans.map((pol) => {
          return (
            <Box>
              {pol.amount} - {pol.maturity_date}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default RepaymentCoverage;

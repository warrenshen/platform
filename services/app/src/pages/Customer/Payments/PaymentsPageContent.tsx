import { Box, Divider, Typography } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { useGetPaymentsForCompanyQuery } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { PaymentMethodEnum, PaymentMethodToLabel } from "lib/enum";
import { createLoanCustomerIdentifier } from "lib/loans";
import { useMemo } from "react";

interface Props {
  companyId: string;
}

export default function CustomerPaymentsPageContent({ companyId }: Props) {
  const { data, error } = useGetPaymentsForCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;
  const payments = useMemo(() => company?.payments || [], [company]);
  const transactions = useMemo(
    () => payments.flatMap((payment) => payment.transactions),
    [payments]
  );
  console.log({ payments, transactions });

  return (
    <PageContent
      title={"Payments"}
      subtitle={"Review your historical payments to Bespoke Financial."}
    >
      <Box>
        {payments.map((payment, index) => (
          <Box key={payment.id}>
            <Box my={4}>
              <Divider />
            </Box>
            <Box>
              <Box display="flex" justifyContent="space-between" width="100%">
                <Typography>{`Payment ${index + 1}`}</Typography>
                <Typography>{`Method: ${
                  payment.method
                    ? PaymentMethodToLabel[payment.method as PaymentMethodEnum]
                    : "Unknown"
                }`}</Typography>
                <Typography>{`Deposit Date: ${formatDateString(
                  payment.deposit_date
                )}`}</Typography>
                <Typography>{`Total Amount: ${formatCurrency(
                  payment.amount
                )}`}</Typography>
              </Box>
              {payment.transactions.map((transaction) => (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                  pl={8}
                  mt={2}
                >
                  {transaction.loan ? (
                    <Box>{`Loan: ${createLoanCustomerIdentifier(
                      transaction.loan
                    )}`}</Box>
                  ) : (
                    <Box>Not to loan</Box>
                  )}
                  <Box display="flex" justifyContent="flex-end" width={200}>
                    {formatCurrency(transaction.to_principal)}
                  </Box>
                  <Box display="flex" justifyContent="flex-end" width={200}>
                    {formatCurrency(transaction.to_interest)}
                  </Box>
                  <Box display="flex" justifyContent="flex-end" width={200}>
                    {formatCurrency(transaction.to_fees)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </PageContent>
  );
}

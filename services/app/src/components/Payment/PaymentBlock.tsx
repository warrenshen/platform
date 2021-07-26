import { Box, Divider, Typography } from "@material-ui/core";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PaymentDrawerLauncher from "components/Payment/PaymentDrawerLauncher";
import { GetRepaymentsForCompanyQuery } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import {
  PaymentMethodEnum,
  PaymentMethodToLabel,
  PaymentStatusEnum,
  PaymentStatusToLabel,
} from "lib/enum";
import { createLoanCustomerIdentifier } from "lib/loans";
import styled from "styled-components";

const Container = styled.div`
  display: flex;

  padding: 24px;
  background-color: white;
  border-radius: 3px;

  overflow: scroll;
`;

interface Props {
  payment: NonNullable<
    GetRepaymentsForCompanyQuery["companies_by_pk"]
  >["payments"][0];
}

export default function PaymentBlock({ payment }: Props) {
  return (
    <Container>
      <Box display="flex" flexDirection="column" width="100%">
        <Typography variant="h6">{`Repayment P${payment.settlement_identifier}`}</Typography>
        <Box display="flex" justifyContent="space-between" my={2}>
          <Box display="flex">
            <Box display="flex" flexDirection="column" width={200}>
              <Typography variant="subtitle2" color="textSecondary">
                Identifier
              </Typography>
              <PaymentDrawerLauncher
                paymentId={payment.id}
                label={`P${payment.settlement_identifier}`}
              />
            </Box>
            <Box display="flex" flexDirection="column" width={200}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Typography>
                {
                  PaymentStatusToLabel[
                    !!payment.reversed_at
                      ? PaymentStatusEnum.Reversed
                      : PaymentStatusEnum.Settled
                  ]
                }
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" width={200}>
              <Typography variant="subtitle2" color="textSecondary">
                Method
              </Typography>
              <Typography>
                {payment.method
                  ? PaymentMethodToLabel[payment.method as PaymentMethodEnum]
                  : "Unknown"}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" width={200}>
              <Typography variant="subtitle2" color="textSecondary">
                Deposit Date
              </Typography>
              <Typography>{formatDateString(payment.deposit_date)}</Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Typography variant="subtitle2" color="textSecondary">
              Total Amount
            </Typography>
            <Typography>{formatCurrency(payment.amount)}</Typography>
          </Box>
        </Box>
        {!payment.reversed_at &&
          payment.transactions.map((transaction, index) => (
            <Box key={transaction.id}>
              <Box my={2}>
                <Divider light />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                width="100%"
                pl={4}
                mt={2}
              >
                <Box display="flex" justifyContent="flex-start" width={50}>
                  <Typography variant="body2" color="textSecondary">
                    {index + 1}
                  </Typography>
                </Box>
                {transaction.loan ? (
                  <Box display="flex" flexDirection="column" flex={1}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Payment To
                    </Typography>
                    <Box display="flex">
                      <LoanDrawerLauncher
                        label={`Loan ${createLoanCustomerIdentifier(
                          transaction.loan
                        )}`}
                        loanId={transaction.loan_id}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" flex={1}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Payment To
                    </Typography>
                    <Typography variant="body1">Account</Typography>
                  </Box>
                )}
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  width={150}
                >
                  {transaction.loan && (
                    <>
                      <Typography variant="subtitle2" color="textSecondary">
                        To Principal
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(transaction.to_principal)}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  width={150}
                >
                  {transaction.loan && (
                    <>
                      <Typography variant="subtitle2" color="textSecondary">
                        To Interest
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(transaction.to_interest)}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  width={150}
                >
                  {transaction.loan && (
                    <>
                      <Typography variant="subtitle2" color="textSecondary">
                        To Late Fees
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(transaction.to_fees)}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  width={150}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    Total
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
      </Box>
    </Container>
  );
}

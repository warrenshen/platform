import { Box, Card, Typography } from "@material-ui/core";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useOpenLoansByCompanyQuery } from "generated/graphql";
import React, { useContext } from "react";

function LoansPage() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data } = useOpenLoansByCompanyQuery({
    variables: {
      companyId,
    },
  });

  const openLoans = data?.loans || [];

  const totalOutstandingPrincipalBalance = openLoans.reduce(
    (sum, openLoan) => sum + openLoan.outstanding_principal_balance || 0,
    0
  );
  const totalOutstandingInterest = openLoans.reduce(
    (sum, openLoan) => sum + openLoan.outstanding_interest || 0,
    0
  );
  const totalOutstandingFees = openLoans.reduce(
    (sum, openLoan) => sum + openLoan.outstanding_fees || 0,
    0
  );

  return (
    <Page appBarTitle={"Overview"}>
      <Box display="flex" flexDirection="column">
        <Box display="flex" justifyContent="space-between" width="100%">
          <Box width="32%">
            <Card>
              <Box display="flex" flexDirection="column" p={2}>
                <Typography variant="h3">
                  {`$${Intl.NumberFormat("en-US").format(
                    totalOutstandingPrincipalBalance
                  )}`}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  total outstanding principal balance
                </Typography>
              </Box>
            </Card>
          </Box>
          <Box width="32%">
            <Card>
              <Box display="flex" flexDirection="column" p={2}>
                <Typography variant="h3">
                  {`$${Intl.NumberFormat("en-US").format(
                    totalOutstandingInterest
                  )}`}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  total outstanding interest
                </Typography>
              </Box>
            </Card>
          </Box>
          <Box width="32%">
            <Card>
              <Box display="flex" flexDirection="column" p={2}>
                <Typography variant="h3">
                  {`$${Intl.NumberFormat("en-US").format(
                    totalOutstandingFees
                  )}`}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  total outstanding fees
                </Typography>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </Page>
  );
}

export default LoansPage;

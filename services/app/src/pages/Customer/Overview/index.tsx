import {
  Box,
  Card,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetCompanyForCustomerOverviewQuery } from "generated/graphql";
import { formatCurrency } from "lib/currency";
import React, { useContext } from "react";
import OutstandingLoansForCustomer from "./OutstandingLoansForCustomer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",

      width: "100%",
    },
    section: {
      display: "flex",
      flexDirection: "column",
    },
    sectionSpace: {
      height: theme.spacing(4),
    },
    box: {
      width: "33%",
    },
  })
);

function CustomerOverviewPage() {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data } = useGetCompanyForCustomerOverviewQuery({
    variables: {
      companyId,
    },
  });

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summary;

  return (
    <Page appBarTitle={"Overview"}>
      <Box className={classes.container}>
        <Box className={classes.section}>
          <Box display="flex" flexDirection="column">
            <Box display="flex" justifyContent="space-between" width="100%">
              <Box className={classes.box}>
                <Card>
                  <Box display="flex" flexDirection="column" p={2}>
                    <Typography variant="h4">
                      {financialSummary
                        ? formatCurrency(
                            financialSummary?.total_outstanding_principal
                          )
                        : "TBD"}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      total outstanding principal balance
                    </Typography>
                  </Box>
                </Card>
              </Box>
              <Box className={classes.box}>
                <Card>
                  <Box display="flex" flexDirection="column" p={2}>
                    <Typography variant="h4">
                      {financialSummary
                        ? formatCurrency(
                            financialSummary?.total_outstanding_interest
                          )
                        : "TBD"}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      total outstanding interest
                    </Typography>
                  </Box>
                </Card>
              </Box>
              <Box className={classes.box}>
                <Card>
                  <Box display="flex" flexDirection="column" p={2}>
                    <Typography variant="h4">
                      {financialSummary
                        ? formatCurrency(
                            financialSummary?.total_outstanding_fees
                          )
                        : "TBD"}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      total outstanding fees
                    </Typography>
                  </Box>
                </Card>
              </Box>
            </Box>
            <Box mt={1} />
            <Box display="flex" justifyContent="space-between" width="100%">
              <Box className={classes.box}>
                <Card>
                  <Box display="flex" flexDirection="column" p={2}>
                    <Typography variant="h4">
                      {financialSummary
                        ? formatCurrency(financialSummary.available_limit)
                        : "TBD"}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      remaining limit
                    </Typography>
                  </Box>
                </Card>
              </Box>
              <Box className={classes.box}>
                <Card>
                  <Box display="flex" flexDirection="column" p={2}>
                    <Typography variant="h4">
                      {financialSummary
                        ? formatCurrency(financialSummary.total_limit)
                        : "TBD"}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      total limit
                    </Typography>
                  </Box>
                </Card>
              </Box>
              <Box className={classes.box} />
            </Box>
          </Box>
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">Outstanding Loans</Typography>
          <Box display="flex" flex={1}>
            <OutstandingLoansForCustomer />
          </Box>
        </Box>
      </Box>
    </Page>
  );
}

export default CustomerOverviewPage;

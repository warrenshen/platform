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
import React, { useContext, useEffect, useState } from "react";
import OutstandingPurchaseOrderLoans from "./OutstandingPurchaseOrderLoans";

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
  const openLoans = company?.loans || [];

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

  const contract = company?.contract;
  const productConfig = contract?.product_config;

  const [maximumLimit, setMaximumLimit] = useState<number | null>(null);

  useEffect(() => {
    if (contract?.product_type && productConfig) {
      if (productConfig && Object.keys(productConfig).length) {
        const fields = productConfig.v1.fields;
        const maximumAmountField = fields.find(
          (field: any) => field.internal_name === "maximum_amount"
        );
        setMaximumLimit(maximumAmountField.value);
      }
    }
  }, [contract, productConfig]);

  return (
    <Page appBarTitle={"Overview"}>
      <Box className={classes.container}>
        <Box className={classes.section}>
          <Box display="flex" flexDirection="column">
            <Box display="flex" justifyContent="space-between" width="100%">
              <Box width="24%">
                <Card>
                  <Box display="flex" flexDirection="column" p={2}>
                    <Typography variant="h3">
                      {formatCurrency(totalOutstandingPrincipalBalance)}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      total outstanding principal balance
                    </Typography>
                  </Box>
                </Card>
              </Box>
              <Box width="24%">
                <Card>
                  <Box display="flex" flexDirection="column" p={2}>
                    <Typography variant="h3">
                      {formatCurrency(totalOutstandingInterest)}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      total outstanding interest
                    </Typography>
                  </Box>
                </Card>
              </Box>
              <Box width="24%">
                <Card>
                  <Box display="flex" flexDirection="column" p={2}>
                    <Typography variant="h3">
                      {formatCurrency(totalOutstandingFees)}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      total outstanding fees
                    </Typography>
                  </Box>
                </Card>
              </Box>
              <Box width="24%">
                <Card>
                  <Box display="flex" flexDirection="column" p={2}>
                    <Typography variant="h3">
                      {maximumLimit ? formatCurrency(maximumLimit) : "TBD"}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      maximum limit
                    </Typography>
                  </Box>
                </Card>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography>Outstanding Loans</Typography>
          <Box display="flex" flex={1}>
            <OutstandingPurchaseOrderLoans />
          </Box>
        </Box>
      </Box>
    </Page>
  );
}

export default CustomerOverviewPage;

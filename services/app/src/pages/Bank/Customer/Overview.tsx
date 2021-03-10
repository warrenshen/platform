import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import PaymentsDataGrid from "components/Repayment/PaymentsDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanTypeEnum,
  ProductTypeEnum,
  useGetCustomerOverviewQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import React, { useContext } from "react";

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

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function CustomerOverviewSubpage({ companyId, productType }: Props) {
  const classes = useStyles();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data } = useGetCustomerOverviewQuery({
    variables: {
      companyId,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summary || null;
  const payments = company?.pending_payments || [];
  const loans = company?.outstanding_loans || [];

  return (
    <Box className={classes.container}>
      <Box className={classes.section}>
        <CustomerFinancialSummaryOverview financialSummary={financialSummary} />
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Typography variant="h6">
          {`Pending Payments${
            payments.length > 0 ? ` (${payments.length})` : ""
          }`}
        </Typography>
        <Box display="flex" flex={1}>
          <Box display="flex" flexDirection="column" width="100%">
            {payments.length > 0 ? (
              <PaymentsDataGrid payments={payments} />
            ) : (
              <Typography variant="body1">
                Customer does not have any pending payments.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Typography variant="h6">
          {`Outstanding Loans${loans.length > 0 ? ` (${loans.length})` : ""}`}
        </Typography>
        <Box display="flex" flex={1}>
          <Box display="flex" flexDirection="column" width="100%">
            {loans.length > 0 ? (
              <PolymorphicLoansDataGrid
                isMultiSelectEnabled={check(role, Action.SelectLoan)}
                isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
                productType={productType}
                loans={loans}
              />
            ) : (
              <Typography variant="body1">
                Customer does not have any outstanding loans.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CustomerOverviewSubpage;

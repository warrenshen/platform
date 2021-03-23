import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import RepaymentsDataGrid from "components/Repayment/RepaymentsDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ProductTypeEnum,
  useGetCustomerOverviewQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ProductTypeToLoanType } from "lib/enum";
import { useContext } from "react";

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

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data } = useGetCustomerOverviewQuery({
    variables: {
      companyId,
      loanType,
    },
  });

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summaries[0] || null;
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
              <RepaymentsDataGrid isExcelExport payments={payments} />
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
                isExcelExport
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

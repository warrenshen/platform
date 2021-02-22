import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import LineOfCreditLoansDataGrid from "components/Loans/LineOfCredit/LineOfCreditLoansDataGrid";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrder/PurchaseOrderLoansDataGrid";
import {
  LoanTypeEnum,
  ProductTypeEnum,
  useGetCompanyForCustomerOverviewQuery,
} from "generated/graphql";
import React from "react";

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

  const { data } = useGetCompanyForCustomerOverviewQuery({
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
  const loans = company?.outstanding_loans || [];

  return (
    <Box className={classes.container}>
      <Box className={classes.section}>
        <CustomerFinancialSummaryOverview financialSummary={financialSummary} />
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Typography variant="h6">Outstanding Loans</Typography>
        <Box display="flex" flex={1}>
          <Box display="flex" flexDirection="column" width="100%">
            {productType === ProductTypeEnum.InventoryFinancing ? (
              <PurchaseOrderLoansDataGrid loans={loans} />
            ) : (
              <LineOfCreditLoansDataGrid loans={loans} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CustomerOverviewSubpage;

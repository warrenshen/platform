import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanTypeEnum,
  ProductTypeEnum,
  useGetActiveLoansForCompanyQuery,
} from "generated/graphql";
import LoansActiveFunded from "pages/Customer/LoansActive/LoansActiveFunded";
import LoansActiveNotFunded from "pages/Customer/LoansActive/LoansActiveNotFunded";
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

function CustomerLoansActivePage() {
  const classes = useStyles();

  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useGetActiveLoansForCompanyQuery({
    variables: {
      companyId,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });

  if (error) {
    alert("Error querying loans. " + error);
  }

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summary || null;

  const canCreateUpdateNewLoan =
    financialSummary && financialSummary?.available_limit > 0;

  return (
    <Page appBarTitle={"Loans - Active"}>
      <Box className={classes.container}>
        <Box className={classes.section}>
          <Typography variant="h6">
            Request a new loan, edit an existing loan, and view active loans
            associated with your account.
          </Typography>
          <Box display="flex" flexDirection="column" mt={1} mb={2}>
            {canCreateUpdateNewLoan ? (
              <Alert severity="info" style={{ alignSelf: "flex-start" }}>
                <Box maxWidth={600}>
                  You have available limit and can request new loans.
                </Box>
              </Alert>
            ) : (
              <Alert severity="warning">
                <Box maxWidth={600}>
                  You have reached your limit and cannot request anymore new
                  loans. Please contact Bespoke if you believe this is a
                  mistake.
                </Box>
              </Alert>
            )}
          </Box>
          <CustomerFinancialSummaryOverview
            isBalanceVisible={false}
            financialSummary={financialSummary}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">Loans - Not Funded</Typography>
          <LoansActiveNotFunded data={data} handleDataChange={refetch} />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">Loans - Funded</Typography>
          <LoansActiveFunded data={data} handleDataChange={refetch} />
        </Box>
      </Box>
    </Page>
  );
}

export default CustomerLoansActivePage;

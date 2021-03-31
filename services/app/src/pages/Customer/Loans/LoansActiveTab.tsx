import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import {
  ProductTypeEnum,
  useGetActiveLoansForCompanyQuery,
} from "generated/graphql";
import { ProductTypeToLoanType } from "lib/enum";
import LoansFunded from "pages/Customer/Loans/LoansFunded";
import LoansNotFunded from "pages/Customer/Loans/LoansNotFunded";

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

function CustomerLoansPageLoansTab({ companyId, productType }: Props) {
  const classes = useStyles();

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, error, refetch } = useGetActiveLoansForCompanyQuery({
    variables: {
      companyId,
      loanType,
    },
  });

  if (error) {
    alert("Error querying loans. " + error);
  }

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summaries[0] || null;

  const canCreateUpdateNewLoan =
    financialSummary && financialSummary?.available_limit > 0;

  return (
    <Box className={classes.container} mt={3}>
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
                loans. Please contact Bespoke if you believe this is a mistake.
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
        <LoansNotFunded
          companyId={companyId}
          productType={productType}
          data={data}
          handleDataChange={refetch}
        />
      </Box>
      {productType !== ProductTypeEnum.LineOfCredit && (
        <>
          <Box className={classes.sectionSpace} />
          <Box className={classes.section}>
            <Typography variant="h6">Loans - Funded</Typography>
            <LoansFunded
              productType={productType}
              data={data}
              handleDataChange={refetch}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default CustomerLoansPageLoansTab;

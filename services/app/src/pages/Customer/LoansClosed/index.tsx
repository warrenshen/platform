import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanTypeEnum,
  useGetClosedLoansForCompanyQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
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

function CustomerLoansClosedPage() {
  const classes = useStyles();

  const {
    user: { companyId, productType, role },
  } = useContext(CurrentUserContext);

  const { data, error } = useGetClosedLoansForCompanyQuery({
    variables: {
      companyId,
      loanType: LoanTypeEnum.PurchaseOrder,
    },
  });

  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const company = data?.companies_by_pk;
  const loans = company?.loans || [];

  return (
    <Page appBarTitle={"Loans - Closed"}>
      <Box className={classes.container}>
        <Box className={classes.section}>
          <Typography variant="h6">View your closed loans.</Typography>
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Box display="flex" flex={1}>
            <PolymorphicLoansDataGrid
              productType={productType}
              loans={loans}
              actionItems={[]}
              isMultiSelectEnabled={check(role, Action.SelectLoan)}
              isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
            />
          </Box>
        </Box>
      </Box>
    </Page>
  );
}

export default CustomerLoansClosedPage;

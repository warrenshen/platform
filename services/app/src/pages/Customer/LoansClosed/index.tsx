import {
  Box,
  createStyles,
  makeStyles,
  Tab,
  Tabs,
  Theme,
  Typography,
} from "@material-ui/core";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetClosedLoansForCompanyQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ProductTypeToLoanType } from "lib/enum";
import { customerRoutes } from "lib/routes";
import { useContext } from "react";
import { useHistory } from "react-router-dom";

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
  const history = useHistory();

  const {
    user: { companyId, productType, role },
  } = useContext(CurrentUserContext);

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, error } = useGetClosedLoansForCompanyQuery({
    variables: {
      companyId,
      loanType,
    },
  });

  if (error) {
    alert("Error querying loans. " + error);
  }

  const company = data?.companies_by_pk;
  const loans = company?.loans || [];

  return (
    <Page appBarTitle={"Loans - Closed"}>
      <Tabs
        value={1}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => {
          if (value === 0) {
            history.push(customerRoutes.loansActive);
          }
        }}
      >
        <Tab label="Active Loans" />
        <Tab label="Closed Loans" />
      </Tabs>
      <Box className={classes.container} mt={3}>
        <Box className={classes.section}>
          <Typography variant="h6">View your closed loans.</Typography>
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Box display="flex" flex={1}>
            <PolymorphicLoansDataGrid
              isMultiSelectEnabled={check(role, Action.SelectLoan)}
              isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
              productType={productType}
              loans={loans}
              actionItems={[]}
            />
          </Box>
        </Box>
      </Box>
    </Page>
  );
}

export default CustomerLoansClosedPage;

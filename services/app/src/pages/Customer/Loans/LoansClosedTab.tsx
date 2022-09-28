import {
  Box,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { useGetClosedLoansForCompanyQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ProductTypeEnum, ProductTypeToLoanType } from "lib/enum";
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
  isActiveContract: boolean;
}

function CustomerLoansPageLoansClosedTab({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, error } = useGetClosedLoansForCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
      loanType,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;
  const loans = company?.loans || [];

  return (
    <Box className={classes.container} mt={3}>
      <Box className={classes.section}>
        <Typography variant="h6">Closed Loans</Typography>
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Box display="flex" flex={1}>
          <PolymorphicLoansDataGrid
            isDisbursementIdentifierVisible={isBankUser}
            // We do not show loan outstanding principal, interest, late fees for Line of Credit.
            isMaturityVisible={productType !== ProductTypeEnum.LineOfCredit}
            isMultiSelectEnabled={false}
            isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
            productType={productType}
            loans={loans}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default CustomerLoansPageLoansClosedTab;

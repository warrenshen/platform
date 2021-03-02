import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  GetActiveLoansForCompanyQuery,
  LoanFragment,
  Loans,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { useContext, useMemo, useState } from "react";

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
      height: theme.spacing(2),
    },
  })
);

interface Props {
  data: GetActiveLoansForCompanyQuery | undefined;
}

function LoansActiveApproved({ data }: Props) {
  const classes = useStyles();

  const {
    user: { companyId, productType, role },
  } = useContext(CurrentUserContext);

  const company = data?.companies_by_pk;
  const loans = useMemo(
    () =>
      (company?.loans || []).filter((loan) =>
        loan.approved_at ? true : false
      ),
    [company?.loans]
  );

  // State for modal(s).
  const [isPayOffLoansModalOpen, setIsPayOffLoansModalOpen] = useState(false);
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"][]>([]);

  const handleSelectLoans = useMemo(
    () => (loans: LoanFragment[]) => {
      setSelectedLoans(loans);
      setSelectedLoanIds(loans.map((loan) => loan.id));
    },
    [setSelectedLoans, setSelectedLoanIds]
  );

  return (
    <Box className={classes.container}>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Box display="flex" flexDirection="row-reverse">
          {isPayOffLoansModalOpen && (
            <CreateRepaymentModal
              companyId={companyId}
              productType={productType}
              selectedLoans={selectedLoans}
              handleClose={() => setIsPayOffLoansModalOpen(false)}
            />
          )}
          <Can perform={Action.RepayPurchaseOrderLoans}>
            <Box>
              <Button
                disabled={selectedLoans.length <= 0}
                variant="contained"
                color="primary"
                onClick={() => setIsPayOffLoansModalOpen(true)}
              >
                Pay Off Loans
              </Button>
            </Box>
          </Can>
        </Box>
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Box display="flex" flex={1}>
          <PolymorphicLoansDataGrid
            isMultiSelectEnabled={check(role, Action.SelectLoan)}
            isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
            productType={productType}
            loans={loans}
            selectedLoanIds={selectedLoanIds}
            handleSelectLoans={handleSelectLoans}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default LoansActiveApproved;

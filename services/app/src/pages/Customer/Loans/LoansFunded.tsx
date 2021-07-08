import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  GetActiveLoansForCompanyQuery,
  LoanFragment,
  Loans,
  ProductTypeEnum,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
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
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  data: GetActiveLoansForCompanyQuery | undefined;
  handleDataChange: () => void;
}

function LoansFunded({
  companyId,
  productType,
  data,
  handleDataChange,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const company = data?.companies_by_pk;
  const loans = useMemo(
    () => (company?.loans || []).filter((loan) => !!loan.funded_at),
    [company?.loans]
  );

  // State for modal(s).
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"][]>([]);

  const handleSelectLoans = useMemo(
    () => (loans: LoanFragment[]) => {
      setSelectedLoans(loans);
      setSelectedLoanIds(loans.map((loan) => loan.id));
    },
    [setSelectedLoans, setSelectedLoanIds]
  );

  const isLineOfCredit = productType === ProductTypeEnum.LineOfCredit;

  return (
    <Box className={classes.container}>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Box display="flex" flexDirection="row-reverse">
          <Can perform={Action.RepayPurchaseOrderLoans}>
            <Box>
              <ModalButton
                label={"Make Repayment"}
                handleClick={({ handleOpen }) => {
                  const fundedLoans = selectedLoans.filter(
                    (loan) => loan.funded_at
                  );
                  if (fundedLoans.length !== selectedLoans.length) {
                    snackbar.showError(
                      "Please unselect any loans which are not funded yet. These may not be paid off yet."
                    );
                    return;
                  }
                  handleOpen();
                }}
                modal={({ handleClose }) => (
                  <CreateRepaymentModal
                    companyId={companyId}
                    productType={productType}
                    initiallySelectedLoanIds={selectedLoanIds}
                    handleClose={() => {
                      handleDataChange();
                      handleClose();
                      setSelectedLoans([]);
                      setSelectedLoanIds([]);
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </Box>
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Box display="flex" flex={1}>
          <PolymorphicLoansDataGrid
            isDisbursementIdentifierVisible={isBankUser}
            // We do not show loan outstanding principal, interest, late fees for Line of Credit.
            isMaturityVisible={productType !== ProductTypeEnum.LineOfCredit}
            isMultiSelectEnabled={
              !isLineOfCredit && check(role, Action.SelectLoan)
            }
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

export default LoansFunded;

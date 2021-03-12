import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import CreateUpdatePolymorphicLoanModal from "components/Loan/CreateUpdatePolymorphicLoanModal";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  GetActiveLoansForCompanyQuery,
  LoanFragment,
  Loans,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
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
  handleDataChange: () => void;
}

function LoansActiveNotFunded({ data, handleDataChange }: Props) {
  const classes = useStyles();

  const {
    user: { productType, role },
  } = useContext(CurrentUserContext);

  const company = data?.companies_by_pk;

  const loans = useMemo(
    () => (company?.loans || []).filter((loan) => !loan.funded_at),
    [company?.loans]
  );
  const financialSummary = company?.financial_summaries[0] || null;

  const canCreateUpdateNewLoan =
    financialSummary?.available_limit && financialSummary?.available_limit > 0;

  // State for modal(s).
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"][]>([]);

  const handleSelectLoans = useMemo(
    () => (loans: LoanFragment[]) =>
      setSelectedLoanIds(loans.map((loan) => loan.id)),
    [setSelectedLoanIds]
  );

  return (
    <Box className={classes.container}>
      <Box display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrders}>
          <ModalButton
            isDisabled={!canCreateUpdateNewLoan || selectedLoanIds.length !== 0}
            label={"Request New Loan"}
            modal={({ handleClose }) => (
              <CreateUpdatePolymorphicLoanModal
                productType={productType}
                actionType={ActionType.New}
                artifactId={null}
                loanId={null}
                handleClose={() => {
                  handleDataChange();
                  handleClose();
                }}
              />
            )}
          />
        </Can>
        <Can perform={Action.EditPurchaseOrderLoan}>
          <Box mr={2}>
            <ModalButton
              isDisabled={selectedLoanIds.length !== 1}
              label={"Edit Loan"}
              modal={({ handleClose }) => (
                <CreateUpdatePolymorphicLoanModal
                  productType={productType}
                  actionType={ActionType.Update}
                  artifactId={null}
                  loanId={selectedLoanIds[0]}
                  handleClose={() => {
                    handleDataChange();
                    handleClose();
                    setSelectedLoanIds([]);
                  }}
                />
              )}
            />
          </Box>
        </Can>
      </Box>
      <Box className={classes.sectionSpace} />
      <Box display="flex" flex={1}>
        <PolymorphicLoansDataGrid
          isMaturityVisible={false}
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
          isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
          productType={productType}
          loans={loans}
          selectedLoanIds={selectedLoanIds}
          handleSelectLoans={handleSelectLoans}
        />
      </Box>
    </Box>
  );
}

export default LoansActiveNotFunded;

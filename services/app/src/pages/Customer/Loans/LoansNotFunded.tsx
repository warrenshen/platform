import { Box, Theme, createStyles, makeStyles } from "@material-ui/core";
import CreateUpdatePolymorphicLoanModal from "components/Loan/CreateUpdatePolymorphicLoanModal";
import DeleteLoanModal from "components/Loan/DeleteLoanModal";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  GetActiveLoansForCompanyQuery,
  LoanFragment,
  Loans,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ActionType, ProductTypeEnum } from "lib/enum";
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

function LoansNotFunded({
  companyId,
  productType,
  data,
  handleDataChange,
}: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { financialSummary } = useContext(CurrentCustomerContext);

  const company = data?.companies_by_pk;

  const loans = useMemo(
    () => (company?.loans || []).filter((loan) => !loan.funded_at),
    [company?.loans]
  );

  const canCreateUpdateNewLoan =
    financialSummary?.available_limit && financialSummary?.available_limit > 0;

  // State for modal(s).
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"][]>([]);

  const selectedLoan = useMemo(
    () =>
      selectedLoanIds.length === 1
        ? loans.find((loan) => loan.id === selectedLoanIds[0])
        : null,
    [loans, selectedLoanIds]
  );

  const handleSelectLoans = useMemo(
    () => (loans: LoanFragment[]) =>
      setSelectedLoanIds(loans.map((loan) => loan.id)),
    [setSelectedLoanIds]
  );

  return (
    <Box className={classes.container}>
      <Box display="flex" flexDirection="row-reverse">
        <Can perform={Action.AddPurchaseOrderLoan}>
          <ModalButton
            isDisabled={!canCreateUpdateNewLoan || selectedLoanIds.length !== 0}
            label={"Request New Loan"}
            modal={({ handleClose }) => (
              <CreateUpdatePolymorphicLoanModal
                companyId={companyId}
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
              isDisabled={!selectedLoan}
              label={"Edit Loan"}
              modal={({ handleClose }) => (
                <CreateUpdatePolymorphicLoanModal
                  companyId={companyId}
                  productType={productType}
                  actionType={ActionType.Update}
                  artifactId={selectedLoan?.artifact_id || null}
                  loanId={selectedLoan?.id}
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
        <Can perform={Action.DeleteLoans}>
          <Box mr={2}>
            <ModalButton
              isDisabled={!selectedLoan}
              label={"Delete Loan"}
              variant={"outlined"}
              modal={({ handleClose }) => (
                <DeleteLoanModal
                  loanId={selectedLoan?.id}
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
          isApprovalStatusVisible
          isDisbursementIdentifierVisible={isBankUser}
          isMaturityVisible={false}
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
          isOriginationDateVisible={false}
          isRequestedDateVisible
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

export default LoansNotFunded;

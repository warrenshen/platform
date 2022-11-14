import { Box } from "@material-ui/core";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
// import CreateRepaymentModalNew from "components/Repayment/v2/CreateRepaymentModalNew";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
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
import { ProductTypeEnum } from "lib/enum";
import { useContext, useMemo, useState } from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  isActiveContract: boolean;
  data: GetActiveLoansForCompanyQuery | undefined;
  handleDataChange: () => void;
}

const LoansFundedNew = ({
  companyId,
  productType,
  isActiveContract,
  data,
  handleDataChange,
}: Props) => {
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
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"][]>([]);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);

  const handleSelectLoans = useMemo(
    () => (loans: LoanFragment[]) => {
      setSelectedLoanIds(loans.map((loan) => loan.id));
    },
    [setSelectedLoanIds]
  );

  const isLineOfCredit = productType === ProductTypeEnum.LineOfCredit;

  return (
    <StyledContainer>
      {isRepaymentModalOpen && (
        // <CreateRepaymentModalNew
        //   companyId={companyId}
        //   productType={productType}
        //   initiallySelectedLoanIds={selectedLoanIds}
        //   handleClose={() => {
        //     handleDataChange();
        //     setIsRepaymentModalOpen(false);
        //     setSelectedLoanIds([]);
        //   }}
        // />
        <CreateRepaymentModal
          companyId={companyId}
          productType={productType}
          initiallySelectedLoanIds={selectedLoanIds}
          handleClose={() => {
            handleDataChange();
            setIsRepaymentModalOpen(false);
            setSelectedLoanIds([]);
          }}
        />
      )}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>Active</Text>
        <Can perform={Action.RepayPurchaseOrderLoans}>
          <PrimaryButton
            dataCy="repay-loans-button"
            isDisabled={
              !isActiveContract ||
              (!isLineOfCredit && selectedLoanIds.length === 0)
            }
            text="Make Repayment"
            height="40px"
            onClick={() => setIsRepaymentModalOpen(true)}
          />
        </Can>
      </Box>
      <Box
        display="flex"
        flex={1}
        data-cy="funded-loans-data-grid-container"
        className="active-loans-data-grid"
      >
        <PolymorphicLoansDataGrid
          isDisbursementIdentifierVisible={isBankUser}
          // We do not show loan outstanding principal, interest, late fees for Line of Credit.
          isMaturityVisible={productType !== ProductTypeEnum.LineOfCredit}
          isMultiSelectEnabled={
            !isLineOfCredit && check(role, Action.SelectLoan)
          }
          isRequestingUserVisible={false}
          isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
          isDaysPastDueVisible
          productType={productType}
          loans={loans}
          selectedLoanIds={selectedLoanIds}
          handleSelectLoans={handleSelectLoans}
        />
      </Box>
    </StyledContainer>
  );
};

export default LoansFundedNew;

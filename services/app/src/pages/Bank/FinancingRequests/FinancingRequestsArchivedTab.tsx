import { Box } from "@material-ui/core";
import ArchiveLoanModal from "components/Loans/ArchiveLoanModal";
import BankFinancingRequestsDataGrid from "components/Loans/BankFinancingRequestsDataGrid";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { LoanFragment, Loans, UserRolesEnum } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

interface Props {
  financingRequests: LoanFragment[];
  userRole: UserRolesEnum | null;
}

export default function BankFinancingRequestsArchivedTab({
  financingRequests,
  userRole,
}: Props) {
  const navigate = useNavigate();

  const [selectedFinancingRequestIds, setSelectedFinancingRequestIds] =
    useState<Loans["id"]>([]);
  const [
    isUnarchiveFinancingRequestModalOpen,
    setIsUnarchiveFinancingRequestModalOpen,
  ] = useState<boolean>(false);

  const selectedFinancingRequest = useMemo(
    () =>
      selectedFinancingRequestIds.length === 1
        ? financingRequests.find(
            (loan) => loan.id === selectedFinancingRequestIds[0]
          )
        : null,
    [financingRequests, selectedFinancingRequestIds]
  );

  const handleSelectFinancingRequests = useMemo(
    () => (loans: LoanFragment[]) => {
      setSelectedFinancingRequestIds(loans.map((loan) => loan.id));
    },
    [setSelectedFinancingRequestIds]
  );

  return (
    <Container>
      {isUnarchiveFinancingRequestModalOpen && (
        <ArchiveLoanModal
          loan={selectedFinancingRequest}
          action={Action.UnarchiveLoan}
          isFinancingRequest
          handleClose={() => {
            setSelectedFinancingRequestIds([]);
            setIsUnarchiveFinancingRequestModalOpen(false);
          }}
        />
      )}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>
          Archived Financing Requests
        </Text>
        <Can perform={Action.UnarchiveLoan}>
          <SecondaryButton
            isDisabled={!selectedFinancingRequest}
            text={"Unarchive"}
            onClick={() => setIsUnarchiveFinancingRequestModalOpen(true)}
          />
        </Can>
      </Box>
      <Box display="flex" flexDirection="column">
        <BankFinancingRequestsDataGrid
          financingRequests={financingRequests}
          selectedFinancingRequestIds={selectedFinancingRequestIds}
          isMultiSelectEnabled={check(userRole, Action.SelectLoan)}
          isApprovalStatusVisible={false}
          handleClickCustomer={(customerId) => {
            navigate(
              getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
            );
          }}
          handleSelectFinancingRequests={handleSelectFinancingRequests}
        />
      </Box>
    </Container>
  );
}

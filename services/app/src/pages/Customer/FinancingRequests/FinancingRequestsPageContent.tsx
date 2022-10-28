import { Box, Typography } from "@material-ui/core";
import CreateUpdatePolymorphicLoanModal from "components/Loan/CreateUpdatePolymorphicLoanModal";
import DeleteFinancingRequestModal from "components/Loans/DeleteFinancingRequestModal";
import FinancingRequestsDataGrid from "components/Loans/FinancingRequestsDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryWarningButton from "components/Shared/Button/SecondaryWarningButton";
import Can from "components/Shared/Can";
import LinearFinancialSummaryOverview from "components/Shared/FinancialSummaries/LinearFinancialSummaryOverview";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import {
  Companies,
  LoanFragment,
  Loans,
  useGetFinancingRequestsForCompanyQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType, ProductTypeEnum, ProductTypeToLoanType } from "lib/enum";
import { useContext, useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  isActiveContract: boolean | null;
}

const FinancingRequestsPageContent = ({
  companyId,
  productType,
  isActiveContract,
}: Props) => {
  const { financialSummary } = useContext(CurrentCustomerContext);

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, error, refetch } = useGetFinancingRequestsForCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
      loanType,
    },
  });

  const company = data?.companies_by_pk;

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const financingRequests: LoanFragment[] = useMemo(
    () => (company?.loans || []).filter((loan) => !loan.funded_at),
    [company?.loans]
  );

  const canCreateUpdateNewLoan =
    isActiveContract &&
    financialSummary?.available_limit &&
    financialSummary?.available_limit > 0;

  const [selectedFinancingRequestIds, setSelectedFinancingRequestIds] =
    useState<Loans["id"][]>([]);
  const handleSelectFinancingRequests = useMemo(
    () => (loans: LoanFragment[]) =>
      setSelectedFinancingRequestIds(loans.map((loan) => loan.id)),
    [setSelectedFinancingRequestIds]
  );

  const selectedFinancingRequest = useMemo(
    () =>
      selectedFinancingRequestIds.length === 1
        ? financingRequests.find(
            (financingRequest) =>
              financingRequest.id === selectedFinancingRequestIds[0]
          )
        : null,
    [selectedFinancingRequestIds, financingRequests]
  );

  // State for modal(s).
  const [
    isCreateUpdateFinancingRequestModalOpen,
    setIsCreateUpdateFinancingRequestModalOpen,
  ] = useState<boolean>(false);
  const [
    isDeleteFinancingRequestModalOpen,
    setIsDeleteFinancingRequestModalOpen,
  ] = useState<boolean>(false);

  return !!productType ? (
    <PageContent
      title={"Financing Requests"}
      subtitle={"Request financing."}
      customerActions={
        <PrimaryButton
          dataCy={"request-financing-button"}
          isDisabled={!isActiveContract || !canCreateUpdateNewLoan}
          text={"Request Financing"}
          height={"40"}
          onClick={() => setIsCreateUpdateFinancingRequestModalOpen(true)}
        />
      }
    >
      {isCreateUpdateFinancingRequestModalOpen && (
        <CreateUpdatePolymorphicLoanModal
          companyId={companyId}
          productType={productType}
          actionType={
            selectedFinancingRequest ? ActionType.Update : ActionType.New
          }
          artifactId={
            selectedFinancingRequest
              ? selectedFinancingRequest.artifact_id
              : null
          }
          loanId={selectedFinancingRequest ? selectedFinancingRequest.id : null}
          handleClose={() => {
            setIsCreateUpdateFinancingRequestModalOpen(false);
            refetch();
          }}
        />
      )}
      {isDeleteFinancingRequestModalOpen && (
        <DeleteFinancingRequestModal
          loan={selectedFinancingRequest as LoanFragment}
          handleClose={() => {
            setIsDeleteFinancingRequestModalOpen(false);
            refetch();
          }}
        />
      )}
      <Box display="flex" flexDirection="column">
        <LinearFinancialSummaryOverview
          adjustedTotalLimit={financialSummary?.adjusted_total_limit || null}
          availableLimit={financialSummary?.available_limit || null}
        />
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Typography variant="h6">Financing Requests</Typography>
          </Box>
          <Box display="flex" flexDirection="row-reverse">
            <Can perform={Action.EditPurchaseOrderLoan}>
              <PrimaryButton
                dataCy={"edit-financing-request-button"}
                isDisabled={!isActiveContract || !selectedFinancingRequest}
                text={"Edit"}
                height={"40"}
                onClick={() => setIsCreateUpdateFinancingRequestModalOpen(true)}
              />
            </Can>
            <Box mr={2} />
            <Can perform={Action.DeleteLoans}>
              <SecondaryWarningButton
                dataCy={"delete-financing-request-button"}
                isDisabled={!isActiveContract || !selectedFinancingRequest}
                text={"Delete"}
                height={"40"}
                onClick={() => setIsDeleteFinancingRequestModalOpen(true)}
              />
            </Can>
          </Box>
        </Box>
        <FinancingRequestsDataGrid
          financingRequests={financingRequests}
          isMultiSelectEnabled
          pager
          showComments={false}
          handleSelectFinancingRequests={handleSelectFinancingRequests}
        />
      </Box>
    </PageContent>
  ) : null;
};

export default FinancingRequestsPageContent;

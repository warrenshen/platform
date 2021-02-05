import { Box, Button } from "@material-ui/core";
import CreatePaymentAdvanceModal from "components/Bank/Advance/CreateAdvanceModal";
import PurchaseOrderLoansView from "components/Loans/PurchaseOrderLoansView";
import {
  LoanFragment,
  LoanTypeEnum,
  useLoansByCompanyAndLoanTypeForBankQuery,
} from "generated/graphql";
import React, { useState } from "react";

interface Props {
  companyId: string;
}

function BankCustomerLoansSubpage({ companyId }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);
  // State for create / update Purchase Order modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);

  const {
    data,
    error,
    loading: isLoansLoading,
    refetch,
  } = useLoansByCompanyAndLoanTypeForBankQuery({
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      companyId,
      loanType: LoanTypeEnum.PurchaseOrder,
    },
  });
  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const purchaseOrderLoans = data?.loans || [];

  return (
    <Box>
      {isCreateModalOpen && (
        <CreatePaymentAdvanceModal
          selectedLoans={selectedLoans}
          handleClose={() => {
            setIsCreateModalOpen(false);
          }}
        ></CreatePaymentAdvanceModal>
      )}
      <Box mb={2} display="flex" flexDirection="row-reverse">
        <Button
          disabled={selectedLoans.length <= 0}
          variant="contained"
          color="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Advance
        </Button>
      </Box>
      <PurchaseOrderLoansView
        isDataLoading={isLoansLoading}
        purchaseOrderLoans={purchaseOrderLoans}
        refetch={refetch}
        handleSelectLoans={(loans) => setSelectedLoans(loans)}
        isCreateUpdateModalOpen={isCreateUpdateModalOpen}
        setIsCreateUpdateModalOpen={setIsCreateUpdateModalOpen}
      ></PurchaseOrderLoansView>
    </Box>
  );
}

export default BankCustomerLoansSubpage;

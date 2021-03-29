import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import UpdateLoanNotesModal from "components/Loans/UpdateLoanNotesModal";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ProductTypeEnum,
  useLoansByCompanyAndLoanTypeForBankQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ProductTypeToLoanType } from "lib/enum";
import { useContext, useState } from "react";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

export default function BankCustomerLoansSubpage({
  companyId,
  productType,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, error, refetch } = useLoansByCompanyAndLoanTypeForBankQuery({
    fetchPolicy: "network-only",
    skip: !loanType,
    notifyOnNetworkStatusChange: true,
    variables: {
      companyId,
      loanType,
    },
  });
  if (error) {
    alert("Error querying loans. " + error);
  }

  const loans = data?.loans || [];

  // State for modal(s).
  const [isUpdateLoanNotesModalOpen, setIsUpdateLoanNotesModalOpen] = useState(
    false
  );
  const [
    isRunCustomerBalancesModalOpen,
    setIsRunCustomerBalancesModalOpen,
  ] = useState(false);
  const [targetLoanId, setTargetLoanId] = useState("");

  const handleEditLoanNotes = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsUpdateLoanNotesModalOpen(true);
  };

  const actionItems = [
    ...(check(role, Action.EditLoanInternalNote)
      ? [
          {
            key: "edit-loan-notes",
            label: "Edit Internal Note",
            handleClick: (params: ValueFormatterParams) =>
              handleEditLoanNotes(params.row.data.id as string),
          },
        ]
      : []),
  ];

  return (
    <Box>
      {isRunCustomerBalancesModalOpen && (
        <RunCustomerBalancesModal
          companyId={companyId}
          handleClose={() => {
            refetch();
            setIsRunCustomerBalancesModalOpen(false);
          }}
        />
      )}
      {isUpdateLoanNotesModalOpen && (
        <UpdateLoanNotesModal
          loanId={targetLoanId}
          handleClose={() => {
            refetch();
            setIsUpdateLoanNotesModalOpen(false);
            setTargetLoanId("");
          }}
        />
      )}
      <Box mb={2} display="flex" flexDirection="row-reverse">
        <Can perform={Action.RunBalances}>
          <Box>
            <Button
              variant="contained"
              color="default"
              onClick={() => setIsRunCustomerBalancesModalOpen(true)}
            >
              Run Balances
            </Button>
          </Box>
        </Can>
      </Box>
      <Box display="flex" flex={1}>
        <PolymorphicLoansDataGrid
          isMultiSelectEnabled={check(role, Action.SelectLoan)}
          isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
          isExcelExport
          productType={productType}
          loans={loans}
          actionItems={actionItems}
        />
      </Box>
    </Box>
  );
}

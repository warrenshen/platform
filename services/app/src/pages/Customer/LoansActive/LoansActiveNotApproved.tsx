import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import CreateUpdatePurchaseOrderLoanModal from "components/Loans/PurchaseOrder/CreateUpdatePurchaseOrderLoanModal";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanStatusEnum,
  LoanTypeEnum,
  useGetCompanyForCustomerLoansQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ActionType } from "lib/enum";
import { useContext, useState } from "react";

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

function LoansActiveNotApproved() {
  const classes = useStyles();

  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useGetCompanyForCustomerLoansQuery({
    variables: {
      companyId,
      loanStatuses: [LoanStatusEnum.Drafted, LoanStatusEnum.ApprovalRequested],
      loanType: LoanTypeEnum.PurchaseOrder,
    },
  });

  if (error) {
    alert("Error querying loans. " + error);
  }

  const company = data?.companies_by_pk;
  const loans = company?.loans || [];
  const financialSummary = company?.financial_summary || null;

  const canCreateUpdateNewLoan =
    financialSummary?.available_limit && financialSummary?.available_limit > 0;

  // State for modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [targetLoanId, setTargetLoanId] = useState("");

  const handleEditPurchaseOrderLoan = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsCreateUpdateModalOpen(true);
  };

  return (
    <Box className={classes.container}>
      <Box display="flex" flexDirection="row-reverse">
        {isCreateUpdateModalOpen && (
          <CreateUpdatePurchaseOrderLoanModal
            actionType={
              targetLoanId === "" ? ActionType.New : ActionType.Update
            }
            loanId={targetLoanId}
            artifactId={null}
            handleClose={() => {
              refetch();
              setIsCreateUpdateModalOpen(false);
              setTargetLoanId("");
            }}
          />
        )}
        <Can perform={Action.AddPurchaseOrders}>
          <Button
            disabled={!canCreateUpdateNewLoan}
            variant="contained"
            color="primary"
            onClick={() => setIsCreateUpdateModalOpen(true)}
          >
            Request New Loan
          </Button>
        </Can>
      </Box>
      <Box className={classes.sectionSpace} />
      <Box display="flex" flex={1}>
        <PolymorphicLoansDataGrid
          isMaturityVisible={false}
          productType={productType}
          loans={loans}
          actionItems={[
            {
              key: "edit-purchase-order-loan",
              label: "Edit",
              handleClick: (params) =>
                handleEditPurchaseOrderLoan(params.row.data.id as string),
            },
          ]}
        />
      </Box>
    </Box>
  );
}

export default LoansActiveNotApproved;

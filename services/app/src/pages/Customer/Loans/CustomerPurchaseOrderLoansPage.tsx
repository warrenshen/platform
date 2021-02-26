import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import CreateUpdatePurchaseOrderLoanModal from "components/Loans/PurchaseOrder/CreateUpdatePurchaseOrderLoanModal";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrder/PurchaseOrderLoansDataGrid";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  Loans,
  LoanTypeEnum,
  useGetCompanyForCustomerLoansQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
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
      height: theme.spacing(4),
    },
  })
);

function CustomerPurchaseOrderLoansPage() {
  const classes = useStyles();

  const {
    user: { companyId, productType, role },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useGetCompanyForCustomerLoansQuery({
    variables: {
      companyId: companyId,
      loanType: LoanTypeEnum.PurchaseOrder,
    },
  });

  if (error) {
    alert("Error querying purchase orders. " + error);
  }

  const company = data?.companies_by_pk;
  const loans = company?.loans || [];
  const financialSummary = company?.financial_summary || null;

  const canCreateUpdateNewLoan =
    financialSummary?.available_limit && financialSummary?.available_limit > 0;

  // State for modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [isPayOffLoansModalOpen, setIsPayOffLoansModalOpen] = useState(false);
  const [targetLoanId, setTargetLoanId] = useState("");
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"][]>([]);

  const handleEditPurchaseOrderLoan = (loanId: string) => {
    setTargetLoanId(loanId);
    setIsCreateUpdateModalOpen(true);
  };

  return (
    <Box className={classes.container}>
      <Box display="flex" flexDirection="column">
        <Typography variant="h6">
          Request a new loan, edit an existing loan, and view all loans
          associated with your account.
        </Typography>
        <Box display="flex" flexDirection="column" mt={1} mb={2}>
          {canCreateUpdateNewLoan ? (
            <Alert severity="info" style={{ alignSelf: "flex-start" }}>
              <Box maxWidth={600}>
                You have available limit and can request new loans.
              </Box>
            </Alert>
          ) : (
            <Alert severity="warning">
              <Box maxWidth={600}>
                You have reached your limit and cannot request anymore new
                loans. Please contact Bespoke if you believe this is a mistake.
              </Box>
            </Alert>
          )}
        </Box>
        <CustomerFinancialSummaryOverview
          isBalanceVisible={false}
          financialSummary={financialSummary}
        />
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Box display="flex" flexDirection="row-reverse" mb={2}>
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
          {isPayOffLoansModalOpen && (
            <CreateRepaymentModal
              companyId={companyId}
              productType={productType}
              selectedLoans={selectedLoans}
              handleClose={() => setIsPayOffLoansModalOpen(false)}
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
          <Can perform={Action.RepayPurchaseOrderLoans}>
            <Box mr={2}>
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
        <Box display="flex" flex={1}>
          <PurchaseOrderLoansDataGrid
            loans={loans}
            selectedLoanIds={selectedLoanIds}
            actionItems={
              check(role, Action.EditPurchaseOrderLoan)
                ? [
                    {
                      key: "edit-purchase-order-loan",
                      label: "Edit",
                      handleClick: (params) =>
                        handleEditPurchaseOrderLoan(
                          params.row.data.id as string
                        ),
                    },
                  ]
                : []
            }
            handleSelectLoans={(loans) => {
              setSelectedLoans(loans);
              setSelectedLoanIds(loans.map((loan) => loan.id));
            }}
            isMultiSelectEnabled={check(role, Action.SelectLoan)}
            isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default CustomerPurchaseOrderLoansPage;

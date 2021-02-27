import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import { Alert } from "@material-ui/lab";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import CreateUpdateLineOfCreditLoanModal from "components/Loans/LineOfCredit/CreateUpdateLineOfCreditLoanModal";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanTypeEnum,
  ProductTypeEnum,
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

function CustomerLoansPage() {
  const classes = useStyles();
  const {
    user: { companyId, role, productType },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useGetCompanyForCustomerLoansQuery({
    variables: {
      companyId: companyId,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });
  if (error) {
    alert("Error querying loans. " + error);
  }

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summary || null;
  const loans = company?.loans || [];

  const canCreateUpdateNewLoan =
    financialSummary?.available_limit && financialSummary?.available_limit > 0;

  // State for modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [targetLoanId, setTargetLoanId] = useState("");

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
            <Alert severity="warning" style={{ alignSelf: "flex-start" }}>
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
        <Can perform={Action.AddPurchaseOrderLoan}>
          <Box pb={2} display="flex" flexDirection="row-reverse">
            {isCreateUpdateModalOpen && (
              <CreateUpdateLineOfCreditLoanModal
                actionType={
                  targetLoanId === "" ? ActionType.New : ActionType.Update
                }
                loanId={targetLoanId}
                handleClose={() => {
                  refetch();
                  setIsCreateUpdateModalOpen(false);
                  setTargetLoanId("");
                }}
              />
            )}
            <Button
              disabled={!canCreateUpdateNewLoan}
              variant="contained"
              color="primary"
              onClick={() => setIsCreateUpdateModalOpen(true)}
            >
              Request New Loan
            </Button>
          </Box>
        </Can>
        <Box flex={1} display="flex">
          <PolymorphicLoansDataGrid
            isMultiSelectEnabled={check(role, Action.SelectLoan)}
            isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
            productType={productType}
            loans={loans}
            actionItems={
              check(role, Action.EditLineOfCredit)
                ? [
                    {
                      key: "edit-line-of-credit",
                      label: "Edit",
                      handleClick: (params: ValueFormatterParams) => {
                        setTargetLoanId(params.row.data.id as string);
                        setIsCreateUpdateModalOpen(true);
                      },
                    },
                  ]
                : []
            }
          />
        </Box>
      </Box>
    </Box>
  );
}

export default CustomerLoansPage;

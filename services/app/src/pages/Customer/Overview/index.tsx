import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import LineOfCreditLoansDataGrid from "components/Loans/LineOfCredit/LineOfCreditLoansDataGrid";
import PurchaseOrderLoansDataGrid from "components/Loans/PurchaseOrder/PurchaseOrderLoansDataGrid";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import Page from "components/Shared/Page";
import Can from "components/Shared/Can";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  Loans,
  LoanTypeEnum,
  ProductTypeEnum,
  useGetCompanyForCustomerOverviewQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import React, { useContext, useState } from "react";

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
    box: {
      width: "33%",
    },
  })
);

function CustomerOverviewPage() {
  const classes = useStyles();
  const {
    user: { companyId, productType, role },
  } = useContext(CurrentUserContext);

  const { data, refetch } = useGetCompanyForCustomerOverviewQuery({
    variables: {
      companyId,
      loanType:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summary || null;
  const loans = company?.outstanding_loans || [];

  const [isCreateRepaymentModalOpen, setIsCreateRepaymentModalOpen] = useState(
    false
  );
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Loans["id"]>([]);

  return (
    <Page appBarTitle={"Overview"}>
      <Box className={classes.container}>
        <Box className={classes.section}>
          <CustomerFinancialSummaryOverview
            financialSummary={financialSummary}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">Outstanding Loans</Typography>
          <Box display="flex" flex={1}>
            <Box display="flex" flexDirection="column" width="100%">
              {isCreateRepaymentModalOpen && (
                <CreateRepaymentModal
                  companyId={companyId}
                  productType={productType}
                  selectedLoans={selectedLoans}
                  handleClose={() => {
                    refetch();
                    setSelectedLoans([]);
                    setSelectedLoanIds([]);
                    setIsCreateRepaymentModalOpen(false);
                  }}
                />
              )}
              <Can perform={Action.RepayPurchaseOrderLoans}>
                <Box display="flex" flexDirection="row-reverse" mb={2}>
                  <Button
                    disabled={selectedLoanIds.length <= 0}
                    variant="contained"
                    color="primary"
                    onClick={() => setIsCreateRepaymentModalOpen(true)}
                  >
                    Pay Off Loans
                  </Button>
                </Box>
              </Can>
              <Box display="flex" flex={1}>
                {productType === ProductTypeEnum.InventoryFinancing ? (
                  <PurchaseOrderLoansDataGrid
                    loans={loans}
                    selectedLoanIds={selectedLoanIds}
                    handleSelectLoans={(loans) => {
                      setSelectedLoans(loans);
                      setSelectedLoanIds(loans.map((loan) => loan.id));
                    }}
                    isMultiSelectEnabled={check(role, Action.SelectLoan)}
                    isViewNotesEnabled={check(
                      role,
                      Action.ViewLoanInternalNote
                    )}
                  />
                ) : (
                  <LineOfCreditLoansDataGrid
                    loans={loans}
                    selectedLoanIds={selectedLoanIds}
                    handleSelectLoans={(loans) => {
                      setSelectedLoans(loans);
                      setSelectedLoanIds(loans.map((loan) => loan.id));
                    }}
                    isMultiSelectEnabled={check(role, Action.SelectLoan)}
                    isViewNotesEnabled={check(
                      role,
                      Action.ViewLoanInternalNote
                    )}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Page>
  );
}

export default CustomerOverviewPage;

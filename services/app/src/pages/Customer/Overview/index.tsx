import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import PaymentsDataGrid from "components/Repayment/PaymentsDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  Loans,
  LoanTypeEnum,
  ProductTypeEnum,
  useGetCustomerOverviewQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
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

  const { data, refetch } = useGetCustomerOverviewQuery({
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
  const payments = company?.pending_payments || [];
  const loans = company?.outstanding_loans || [];

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
          <Typography variant="h6">
            {`Pending Payments${
              payments.length > 0 ? `(${payments.length})` : ""
            }`}
          </Typography>
          <Box display="flex" flex={1}>
            <Box display="flex" flexDirection="column" width="100%">
              <Box display="flex" flex={1}>
                {payments.length > 0 ? (
                  <PaymentsDataGrid payments={payments} />
                ) : (
                  <Typography variant="body1">
                    You do not have any pending payments.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Typography variant="h6">
            {`Outstanding Loans${loans.length > 0 ? `(${loans.length})` : ""}`}
          </Typography>
          <Box display="flex" flex={1}>
            <Box display="flex" flexDirection="column" width="100%">
              {loans.length > 0 ? (
                <>
                  <Can perform={Action.RepayPurchaseOrderLoans}>
                    <Box display="flex" flexDirection="row-reverse" mb={2}>
                      <ModalButton
                        isDisabled={selectedLoanIds.length <= 0}
                        label={"Make Payment"}
                        modal={({ handleClose }) => (
                          <CreateRepaymentModal
                            companyId={companyId}
                            productType={productType}
                            selectedLoans={selectedLoans}
                            handleClose={() => {
                              refetch();
                              handleClose();
                              setSelectedLoans([]);
                              setSelectedLoanIds([]);
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Can>
                  <Box display="flex" flex={1}>
                    <PolymorphicLoansDataGrid
                      isMultiSelectEnabled={check(role, Action.SelectLoan)}
                      isViewNotesEnabled={check(
                        role,
                        Action.ViewLoanInternalNote
                      )}
                      productType={productType}
                      loans={loans}
                      selectedLoanIds={selectedLoanIds}
                      handleSelectLoans={(loans) => {
                        setSelectedLoans(loans);
                        setSelectedLoanIds(loans.map((loan) => loan.id));
                      }}
                    />
                  </Box>
                </>
              ) : (
                <Typography variant="body1">
                  You do not have any outstanding loans.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Page>
  );
}

export default CustomerOverviewPage;

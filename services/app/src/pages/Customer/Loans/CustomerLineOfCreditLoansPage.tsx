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
import LineOfCreditLoansDataGrid from "components/Loans/LineOfCredit/LineOfCreditLoansDataGrid";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanTypeEnum,
  useGetCompanyForCustomerLoansQuery,
} from "generated/graphql";
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

function CustomerLineOfCreditLoansPage() {
  const classes = useStyles();

  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data, error, refetch } = useGetCompanyForCustomerLoansQuery({
    variables: {
      companyId,
      loanType: LoanTypeEnum.LineOfCredit,
    },
  });
  if (error) {
    alert("Error querying line of credit loans. " + error);
  }

  const company = data?.companies_by_pk;
  const loans = company?.loans || [];
  const financialSummary = company?.financial_summary || null;

  const canCreateUpdateNewLoan =
    financialSummary?.available_limit && financialSummary?.available_limit > 0;

  // State for modal(s).
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [targetLoanId, setTargetLoanId] = useState("");

  // const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

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
              <span>You have available limit and can request new loans.</span>
            </Alert>
          ) : (
            <Alert severity="warning">
              <span>
                You have reached your limit and cannot request anymore new
                loans. Please contact Bespoke if you believe this is a mistake.
              </span>
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
        <Box flex={1} display="flex">
          <LineOfCreditLoansDataGrid
            loans={loans}
            actionItems={[
              {
                key: "edit-line-of-credit",
                label: "Edit",
                handleClick: (params: ValueFormatterParams) => {
                  setTargetLoanId(params.row.data.id as string);
                  setIsCreateUpdateModalOpen(true);
                },
              },
            ]}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default CustomerLineOfCreditLoansPage;

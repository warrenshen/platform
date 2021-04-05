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
import RepaymentsDataGrid from "components/Repayment/RepaymentsDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  ProductTypeEnum,
  useGetCustomerOverviewQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ProductTypeToLoanType } from "lib/enum";
import { useContext, useMemo, useState } from "react";

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

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function CustomerOverviewSubpage({ companyId, productType }: Props) {
  const classes = useStyles();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, refetch } = useGetCustomerOverviewQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
      loanType,
    },
  });

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summaries[0] || null;
  const payments = company?.pending_payments || [];
  const loans = company?.outstanding_loans || [];

  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

  const selectedLoanIds = useMemo(() => selectedLoans.map((loan) => loan.id), [
    selectedLoans,
  ]);

  return (
    <Box className={classes.container}>
      <Box className={classes.section}>
        <CustomerFinancialSummaryOverview financialSummary={financialSummary} />
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Typography variant="h6">
          {`Pending Payments${
            payments.length > 0 ? ` (${payments.length})` : ""
          }`}
        </Typography>
        <Box display="flex" flexDirection="row-reverse" mb={2}>
          {productType === ProductTypeEnum.LineOfCredit && (
            <Can perform={Action.RepayPurchaseOrderLoans}>
              <ModalButton
                label={"Make Payment"}
                modal={({ handleClose }) => (
                  <CreateRepaymentModal
                    companyId={companyId}
                    productType={productType}
                    selectedLoans={[]}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Can>
          )}
        </Box>
        <Box display="flex" flex={1}>
          <Box display="flex" flexDirection="column" width="100%">
            {payments.length > 0 ? (
              <RepaymentsDataGrid isExcelExport payments={payments} />
            ) : (
              <Typography variant="body1">
                Customer does not have any pending payments.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {productType !== ProductTypeEnum.LineOfCredit && (
        <>
          <Box className={classes.sectionSpace} />
          <Box className={classes.section}>
            <Typography variant="h6">
              {`Outstanding Loans${
                loans.length > 0 ? ` (${loans.length})` : ""
              }`}
            </Typography>
            <Box display="flex" flexDirection="row-reverse" mb={2}>
              <Can perform={Action.RepayPurchaseOrderLoans}>
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
                      }}
                    />
                  )}
                />
              </Can>
            </Box>
            <Box display="flex" flex={1}>
              <Box display="flex" flexDirection="column" width="100%">
                {loans.length > 0 ? (
                  <PolymorphicLoansDataGrid
                    isExcelExport
                    isMultiSelectEnabled={check(role, Action.SelectLoan)}
                    isViewNotesEnabled={check(
                      role,
                      Action.ViewLoanInternalNote
                    )}
                    productType={productType}
                    loans={loans}
                    selectedLoanIds={selectedLoanIds}
                    handleSelectLoans={(loans) => setSelectedLoans(loans)}
                  />
                ) : (
                  <Typography variant="body1">
                    Customer does not have any outstanding loans.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

export default CustomerOverviewSubpage;

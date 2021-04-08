import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import CreateUpdatePolymorphicLoanModal from "components/Loan/CreateUpdatePolymorphicLoanModal";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import RepaymentsDataGrid from "components/Repayment/RepaymentsDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoanFragment,
  ProductTypeEnum,
  useGetCustomerOverviewQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ActionType, ProductTypeToLoanType } from "lib/enum";
import { useContext, useMemo, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",

      width: "100%",
      marginTop: 24,
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

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function CustomerOverviewPageContent({ companyId, productType }: Props) {
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
  const canCreateUpdateNewLoan =
    financialSummary?.available_limit && financialSummary?.available_limit > 0;

  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

  const selectedLoanIds = useMemo(() => selectedLoans.map((loan) => loan.id), [
    selectedLoans,
  ]);

  return (
    <PageContent
      title={"Overview"}
      actions={
        <>
          <Can perform={Action.RepayPurchaseOrderLoans}>
            <Box>
              <ModalButton
                label={"Make Payment"}
                modal={({ handleClose }) => (
                  <CreateRepaymentModal
                    companyId={companyId}
                    productType={productType}
                    initiallySelectedLoanIds={[]}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
          <Can perform={Action.AddPurchaseOrderLoan}>
            <Box mr={2}>
              <ModalButton
                isDisabled={
                  !canCreateUpdateNewLoan || selectedLoanIds.length !== 0
                }
                color={"default"}
                variant={"outlined"}
                label={"Request New Loan"}
                modal={({ handleClose }) => (
                  <CreateUpdatePolymorphicLoanModal
                    companyId={companyId}
                    productType={productType}
                    actionType={ActionType.New}
                    artifactId={null}
                    loanId={null}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
        </>
      }
    >
      <Box className={classes.container}>
        <Box className={classes.section}>
          <CustomerFinancialSummaryOverview
            financialSummary={financialSummary}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">
              {`Pending Payments${
                payments.length > 0 ? ` (${payments.length})` : ""
              }`}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row-reverse" mb={2}>
            {productType === ProductTypeEnum.LineOfCredit && (
              <Can perform={Action.RepayPurchaseOrderLoans}>
                <ModalButton
                  label={"Make Payment"}
                  modal={({ handleClose }) => (
                    <CreateRepaymentModal
                      companyId={companyId}
                      productType={productType}
                      initiallySelectedLoanIds={[]}
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
              <Box display="flex" flex={1}>
                {payments.length > 0 ? (
                  <RepaymentsDataGrid payments={payments} />
                ) : (
                  <Typography variant="body1">No pending payments</Typography>
                )}
              </Box>
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
                    label={"Make Payment"}
                    modal={({ handleClose }) => (
                      <CreateRepaymentModal
                        companyId={companyId}
                        productType={productType}
                        initiallySelectedLoanIds={selectedLoanIds}
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
                        handleSelectLoans={(loans) => setSelectedLoans(loans)}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body1">
                      No outstanding loans
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </PageContent>
  );
}

export default CustomerOverviewPageContent;

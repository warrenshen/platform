import {
  Box,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import CreateUpdateInvoiceModal from "components/Invoices/CreateUpdateInvoiceModal";
import CreateUpdatePolymorphicLoanModal from "components/Loan/CreateUpdatePolymorphicLoanModal";
import CreateAdjustmentModal from "components/Loans/CreateAdjustmentModal";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import DeletePaymentModal from "components/Payment/DeletePaymentModal";
import CreateUpdatePurchaseOrderModal from "components/PurchaseOrder/CreateUpdatePurchaseOrderModal";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import RepaymentsDataGrid from "components/Repayment/RepaymentsDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { NotificationBubble } from "components/Shared/NotificationBubble/NotificationBubble";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  LoanFragment,
  PaymentLimitedFragment,
  Payments,
  useGetCustomerOverviewQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import {
  ActionType,
  CustomMessageEnum,
  FeatureFlagEnum,
  ProductTypeEnum,
  ProductTypeToLoanType,
  ReportingRequirementsCategoryEnum,
} from "lib/enum";
import { useGetMissingReportsInfo } from "lib/finance/reports/reports";
import {
  isInvoiceFinancingProductType,
  isLineOfCreditProductType,
  isPurchaseOrderProductType,
} from "lib/settings";
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
      height: theme.spacing(6),
    },
  })
);

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  isActiveContract: boolean;
}

export default function CustomerOverviewPageContent({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { financialSummary } = useContext(CurrentCustomerContext);
  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, refetch, error } = useGetCustomerOverviewQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      company_id: companyId,
      loan_type: loanType,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;
  const parentCompany = company?.parent_company;
  const contract = company?.contract || null;
  const payments = company?.pending_payments || [];
  const loans = company?.outstanding_loans || [];
  const settings = company?.settings || null;
  const financialSummaries = company?.financial_summaries || [];
  const needsRecompute = financialSummaries.filter(
    (summary) => summary.needs_recompute === true
  );
  const runBalanceStartDate = needsRecompute[needsRecompute.length - 1]?.date;
  const runBalanceEndDate = needsRecompute[0]?.date;

  const canCreateUpdateNewLoan =
    isActiveContract &&
    financialSummary?.available_limit &&
    financialSummary?.available_limit > 0;
  const canCreateRepaymentLoan =
    isActiveContract &&
    (financialSummary?.total_outstanding_principal > 0 ||
      financialSummary?.total_outstanding_interest > 0 ||
      financialSummary?.total_outstanding_fees > 0);
  const customMessage = settings?.custom_messages_payload
    ? settings?.custom_messages_payload[CustomMessageEnum.OVERVIEW_PAGE] || null
    : null;
  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

  const selectedLoanIds = useMemo(
    () => selectedLoans.map((loan) => loan.id),
    [selectedLoans]
  );

  const [selectedPaymentIds, setSelectedPaymentIds] = useState<Payments["id"]>(
    []
  );

  const selectedPaymentId = useMemo(
    () => (selectedPaymentIds.length === 1 ? selectedPaymentIds[0] : null),
    [selectedPaymentIds]
  );

  const handleSelectPayments = useMemo(
    () => (payments: PaymentLimitedFragment[]) =>
      setSelectedPaymentIds(payments.map((payment) => payment.id)),
    [setSelectedPaymentIds]
  );

  const {
    missingFinancialReportCount,
    isThereAnyFinancialReportOlderThanFourMonth,
    isLatestBorrowingBaseMissing,
  } = useGetMissingReportsInfo(companyId);

  const renderMissingReportAlertMessage = () => {
    if (missingFinancialReportCount > 0 && !isLatestBorrowingBaseMissing) {
      return `Please submit your financial certifications for the previous ${missingFinancialReportCount} month(s).`;
    } else if (
      missingFinancialReportCount === 0 &&
      isLatestBorrowingBaseMissing
    ) {
      return `Please submit your most recent borrowing base documents.`;
    }
    return `Please submit your most recent borrowing base documents as well as your financial certifications for the previous ${missingFinancialReportCount} month(s).`;
  };

  const featureFlags = settings?.feature_flags_payload || {};
  const reportingCategory =
    !!featureFlags &&
    featureFlags.hasOwnProperty(FeatureFlagEnum.ReportingRequirementsCategory)
      ? featureFlags[FeatureFlagEnum.ReportingRequirementsCategory]
      : null;
  const isMetrcBased =
    reportingCategory === ReportingRequirementsCategoryEnum.Four;
  const areReportsMissing =
    !isMetrcBased &&
    (missingFinancialReportCount > 0 || isLatestBorrowingBaseMissing);

  /**
   * Customer Overview page shows 2 customer actions.
   * 1. Create artifact action.
   * - If Dispensary Financing, Inventory Financing, or Purchase Money Financing, "Create PO".
   * - If Invoice Financing, "Create Invoice".
   * - If Line of Credit, "Request New Loan" (this creates LineOfCredit row and Loan row).
   * 2. Make repayment action, "Make Repayment".
   */
  return (
    <PageContent
      title={"Overview"}
      bankActions={
        <>
          <Can perform={Action.CreateAdjustment}>
            <Box>
              <ModalButton
                label={"Create Adjustment"}
                color={"default"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <CreateAdjustmentModal
                    companyId={companyId}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Can>
          <Can perform={Action.RunBalances}>
            <Box mr={2}>
              <Box
                display="flex"
                flexDirection="column"
                position="relative"
                alignItems="end"
              >
                {needsRecompute.length > 0 && (
                  <NotificationBubble>
                    {needsRecompute.length}
                  </NotificationBubble>
                )}
                <ModalButton
                  label={"Run Balances"}
                  color={"default"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <RunCustomerBalancesModal
                      companyId={companyId}
                      companyName={company?.name || ""}
                      recommendedStartDate={runBalanceStartDate}
                      recommendedEndDate={runBalanceEndDate}
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
          </Can>
        </>
      }
      customerActions={
        <>
          <Can perform={Action.RepayPurchaseOrderLoans}>
            <Box>
              <ModalButton
                isDisabled={!canCreateRepaymentLoan}
                label={"Make Repayment"}
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
          {isPurchaseOrderProductType(productType) && (
            <Can perform={Action.AddPurchaseOrders}>
              <Box mr={2}>
                <ModalButton
                  dataCy={"create-po-button"}
                  color={"default"}
                  variant={"outlined"}
                  label={"Create PO"}
                  isDisabled={!isActiveContract}
                  modal={({ handleClose }) => (
                    <CreateUpdatePurchaseOrderModal
                      actionType={ActionType.New}
                      companyId={companyId}
                      purchaseOrderId={null}
                      productType={productType}
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
          )}
          {isInvoiceFinancingProductType(productType) && (
            <Can perform={Action.AddInvoices}>
              <Box mr={2}>
                <ModalButton
                  color={"default"}
                  variant={"outlined"}
                  label={"Create Invoice"}
                  modal={({ handleClose }) => (
                    <CreateUpdateInvoiceModal
                      isInvoiceForLoan
                      actionType={ActionType.New}
                      companyId={companyId}
                      invoiceId={null}
                      productType={productType}
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
          )}
          {isLineOfCreditProductType(productType) && (
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
          )}
        </>
      }
    >
      <Box className={classes.container}>
        {!!customMessage && (
          <Box mb={2}>
            <Alert severity="error">
              <Typography variant="h6">{customMessage}</Typography>
            </Alert>
          </Box>
        )}
        {areReportsMissing && (
          <Alert severity="warning">
            <Typography variant="h6">{`Action Required: ${renderMissingReportAlertMessage()}`}</Typography>
            {isThereAnyFinancialReportOlderThanFourMonth ? (
              <span>
                If you are missing financial certifications older than 4 months,
                please reach out to Bespoke at{" "}
                <a href="mailto:support@bespokefinancial.com">
                  support@bespokefinancial.com.
                </a>
              </span>
            ) : null}
          </Alert>
        )}
        <Box className={classes.section}>
          <CustomerFinancialSummaryOverview
            label={
              (parentCompany?.companies || []).length > 1
                ? `${parentCompany?.name}: ${company?.name}`
                : company?.name
            }
            companyId={companyId}
            productType={productType}
            contract={contract}
            financialSummary={financialSummary}
          />
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">
              {`Pending Repayments${
                payments.length > 0 ? ` (${payments.length})` : ""
              }`}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row-reverse" mb={2}>
            {productType === ProductTypeEnum.LineOfCredit && (
              <Can perform={Action.RepayPurchaseOrderLoans}>
                <Box>
                  <ModalButton
                    isDisabled={!canCreateRepaymentLoan}
                    label={"Make Repayment"}
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
            )}
            {!!selectedPaymentId && (
              <Can perform={Action.DeleteRepayments}>
                <Box mr={2}>
                  <ModalButton
                    label={"Delete Repayment"}
                    variant={"outlined"}
                    modal={({ handleClose }) => (
                      <DeletePaymentModal
                        paymentId={selectedPaymentId}
                        handleClose={() => {
                          refetch();
                          handleClose();
                          setSelectedPaymentIds([]);
                        }}
                      />
                    )}
                  />
                </Box>
              </Can>
            )}
          </Box>
          <Box display="flex" flex={1}>
            <Box display="flex" flexDirection="column" width="100%">
              <Box display="flex" flex={1}>
                {payments.length > 0 ? (
                  <RepaymentsDataGrid
                    isMultiSelectEnabled
                    payments={payments}
                    selectedPaymentIds={selectedPaymentIds}
                    handleSelectPayments={handleSelectPayments}
                  />
                ) : (
                  <Typography variant="body1">No pending repayments</Typography>
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
                    isDisabled={!canCreateRepaymentLoan}
                    label={"Make Repayment"}
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
                        isDisbursementIdentifierVisible={isBankUser}
                        isMultiSelectEnabled={check(role, Action.SelectLoan)}
                        isViewNotesEnabled={check(
                          role,
                          Action.ViewLoanInternalNote
                        )}
                        isDaysPastDueVisible
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

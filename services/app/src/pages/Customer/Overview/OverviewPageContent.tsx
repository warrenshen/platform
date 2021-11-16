import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CreateAdjustmentModal from "components/Loans/CreateAdjustmentModal";
import CreateUpdateInvoiceModal from "components/Invoices/CreateUpdateInvoiceModal";
import CreateUpdatePolymorphicLoanModal from "components/Loan/CreateUpdatePolymorphicLoanModal";
import CreateUpdatePurchaseOrderModal from "components/PurchaseOrder/CreateUpdatePurchaseOrderModal";
import CustomerFinancialSummaryOverview from "components/CustomerFinancialSummary/CustomerFinancialSummaryOverview";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import DeletePaymentModal from "components/Payment/DeletePaymentModal";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import RepaymentsDataGrid from "components/Repayment/RepaymentsDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
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
  ProductTypeEnum,
  ProductTypeToLoanType,
} from "lib/enum";
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
}

export default function CustomerOverviewPageContent({
  companyId,
  productType,
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
    fetchPolicy: "network-only",
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
  const contract = company?.contract || null;
  const payments = company?.pending_payments || [];
  const loans = company?.outstanding_loans || [];
  const settings = company?.settings || null;

  const canCreateUpdateNewLoan =
    financialSummary?.available_limit && financialSummary?.available_limit > 0;
  const canCreateRepaymentLoan =
    financialSummary?.total_outstanding_principal > 0 ||
    financialSummary?.total_outstanding_interest > 0 ||
    financialSummary?.total_outstanding_fees > 0;
  const customMessage = settings?.custom_messages_payload
    ? settings?.custom_messages_payload[CustomMessageEnum.OVERVIEW_PAGE] || null
    : null;

  const [selectedLoans, setSelectedLoans] = useState<LoanFragment[]>([]);

  const selectedLoanIds = useMemo(() => selectedLoans.map((loan) => loan.id), [
    selectedLoans,
  ]);

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
              <ModalButton
                label={"Run Balances"}
                color={"default"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <RunCustomerBalancesModal
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
                  color={"default"}
                  variant={"outlined"}
                  label={"Create PO"}
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
        <Box className={classes.section}>
          <CustomerFinancialSummaryOverview
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

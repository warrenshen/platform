import {
  Box,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import CreateAccountLevelFeeModal from "components/Fee/CreateAccountLevelFeeModal";
import CreateAccountLevelFeeWaiverModal from "components/Fee/CreateAccountLevelFeeWaiverModal";
import CreateHoldingAccountCreditModal from "components/Fee/CreateHoldingAccountCreditModal";
import PayoutHoldingAccountModal from "components/Fee/PayoutHoldingAccountModal";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import DeletePaymentModal from "components/Payment/DeletePaymentModal";
import FeesDataGrid from "components/Payment/FeesDataGrid";
import CreateAccountFeesRepaymentModal from "components/Repayment/CreateAccountFeesRepaymentModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentCustomerContext } from "contexts/CurrentCustomerContext";
import {
  PaymentLimitedFragment,
  Payments,
  useGetCustomerAccountQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { ProductTypeEnum } from "lib/enum";
import { formatCurrency } from "lib/number";
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
  companyId: string;
  productType: ProductTypeEnum;
}

export default function CustomerAccountPageContent({
  companyId,
  productType,
}: Props) {
  const classes = useStyles();

  const { financialSummary } = useContext(CurrentCustomerContext);

  const { data, refetch, error } = useGetCustomerAccountQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;
  const fees = company?.fee_payments || [];

  const accountBalancePayload = financialSummary?.account_level_balance_payload;
  const accountFees =
    accountBalancePayload?.fees_total != null
      ? accountBalancePayload.fees_total
      : null;
  const accountCredits =
    accountBalancePayload?.credits_total != null
      ? accountBalancePayload.credits_total
      : null;

  const canCreateRepaymentAccountFee = !!accountFees;

  const [selectedPaymentIdsForFees, setSelectedPaymentIdsForFees] = useState<
    Payments["id"]
  >([]);

  const selectedPaymentIdForFees = useMemo(
    () =>
      selectedPaymentIdsForFees.length === 1
        ? selectedPaymentIdsForFees[0]
        : null,
    [selectedPaymentIdsForFees]
  );

  const handleSelectFees = useMemo(
    () => (payments: PaymentLimitedFragment[]) =>
      setSelectedPaymentIdsForFees(payments.map((payment) => payment.id)),
    [setSelectedPaymentIdsForFees]
  );

  return (
    <PageContent
      title={"Account Fees / Credits"}
      bankActions={
        <>
          <Can perform={Action.RunBalances}>
            <Box>
              <ModalButton
                label={"Payout Holding Account"}
                color={"default"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <PayoutHoldingAccountModal
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
                label={"Create Holding Account Credit"}
                color={"default"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <CreateHoldingAccountCreditModal
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
                label={"Create Fee Waiver"}
                color={"default"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <CreateAccountLevelFeeWaiverModal
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
                label={"Create Fee"}
                color={"default"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <CreateAccountLevelFeeModal
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
                isDisabled={!canCreateRepaymentAccountFee}
                label={"Make Repayment"}
                modal={({ handleClose }) => (
                  <CreateAccountFeesRepaymentModal
                    companyId={companyId}
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
        </>
      }
    >
      <Box className={classes.container}>
        <Box className={classes.section}>
          <Box>
            <Box display="flex" flexDirection="column">
              <Typography variant="h5">
                {formatCurrency(accountFees, "TBD")}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Accrued Account Fees
              </Typography>
            </Box>
          </Box>
          <Box mt={2}>
            <Box display="flex" flexDirection="column">
              <Typography variant="h5">
                {formatCurrency(accountCredits, "TBD")}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Holding Account Credits
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box className={classes.sectionSpace} />
        <Box className={classes.section}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Account Fees</Typography>
          </Box>
          <Box display="flex" flexDirection="row-reverse" mb={2}>
            {!!selectedPaymentIdForFees && (
              <Can perform={Action.DeleteRepayments}>
                <ModalButton
                  label={"Delete Fee"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <DeletePaymentModal
                      paymentId={selectedPaymentIdForFees}
                      handleClose={() => {
                        refetch();
                        handleClose();
                        setSelectedPaymentIdsForFees([]);
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
                {fees.length > 0 ? (
                  <FeesDataGrid
                    fees={fees}
                    handleSelectFees={handleSelectFees}
                    isMultiSelectEnabled={true}
                  />
                ) : (
                  <Typography variant="body1">No pending fees</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </PageContent>
  );
}

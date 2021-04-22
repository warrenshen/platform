import {
  Box,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CreateAdjustmentModal from "components/Loans/CreateAdjustmentModal";
import DeletePaymentModal from "components/Payment/DeletePaymentModal";
import FeesDataGrid from "components/Payment/FeesDataGrid";
import CreateRepaymentModal from "components/Repayment/CreateRepaymentModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Payments,
  ProductTypeEnum,
  useGetCustomerAccountQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { formatCurrency } from "lib/currency";
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

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data, refetch, error } = useGetCustomerAccountQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const company = data?.companies_by_pk;
  const financialSummary = company?.financial_summaries[0] || null;
  const fees = company?.fee_payments || [];
  const canCreateRepaymentLoan =
    financialSummary?.total_outstanding_principal > 0 ||
    financialSummary?.total_outstanding_interest > 0 ||
    financialSummary?.total_outstanding_fees;

  const accountBalancePayload = financialSummary?.account_level_balance_payload;
  let accountFees = -1;
  let accountCredits = -1;
  if (accountBalancePayload && Object.keys(accountBalancePayload).length > 0) {
    // Keys you can use:
    //  fees_total: How many account-level fees in $ you owe currently
    //  credits_total: How many credits does Bespoke owe you due to overpayments
    accountFees = accountBalancePayload.fees_total;
    accountCredits = accountBalancePayload.credits_total;
  }

  const [selectedPaymentIds, setSelectedPaymentIds] = useState<Payments["id"]>(
    []
  );

  const selectedPaymentId = useMemo(
    () => (selectedPaymentIds.length === 1 ? selectedPaymentIds[0] : null),
    [selectedPaymentIds]
  );

  return (
    <PageContent
      title={"Account Fees / Credits"}
      bankActions={
        <>
          <Can perform={Action.RunBalances}>
            <Box mr={2}>
              <ModalButton
                label={"Create Account Fee (WIP)"}
                color={"default"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <CreateAdjustmentModal
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
      customerActions={
        <>
          <Can perform={Action.RepayPurchaseOrderLoans}>
            <Box>
              <ModalButton
                isDisabled={!canCreateRepaymentLoan}
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
        </>
      }
    >
      <Box className={classes.container}>
        <Box className={classes.section}>
          <Box>
            <Box display="flex" flexDirection="column">
              <Typography variant="h5">
                {accountFees !== -1 ? formatCurrency(accountFees) : "TBD"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Accrued Account Fees
              </Typography>
            </Box>
          </Box>
          <Box mt={2}>
            <Box display="flex" flexDirection="column">
              <Typography variant="h5">
                {accountCredits !== -1 ? formatCurrency(accountCredits) : "TBD"}
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
            {productType === ProductTypeEnum.LineOfCredit && (
              <Can perform={Action.RepayPurchaseOrderLoans}>
                <Box>
                  <ModalButton
                    isDisabled={!canCreateRepaymentLoan}
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
            )}
            {!!selectedPaymentId && (
              <Can perform={Action.DeleteRepayments}>
                <ModalButton
                  label={"Delete Payment"}
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
              </Can>
            )}
          </Box>
          <Box display="flex" flex={1}>
            <Box display="flex" flexDirection="column" width="100%">
              <Box display="flex" flex={1}>
                {fees.length > 0 ? (
                  <FeesDataGrid isExcelExport={isBankUser} fees={fees} />
                ) : (
                  <Typography variant="body1">No pending payments</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </PageContent>
  );
}

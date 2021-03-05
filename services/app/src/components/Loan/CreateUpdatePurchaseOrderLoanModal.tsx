import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import PurchaseOrderLoanForm from "components/Loan/PurchaseOrderLoanForm";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoansInsertInput,
  LoanStatusEnum,
  LoanTypeEnum,
  ProductTypeEnum,
  Scalars,
  useAddLoanMutation,
  useApprovedPurchaseOrdersQuery,
  useGetCompanyNextLoanIdentifierMutation,
  useGetLoanForCustomerQuery,
  useUpdateLoanMutation,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { submitLoanMutation } from "lib/api/loans";
import { formatCurrency } from "lib/currency";
import { ActionType } from "lib/enum";
import {
  Artifact,
  listArtifactsForCreateLoan,
} from "lib/finance/loans/artifacts";
import { isNull, mergeWith } from "lodash";
import { useContext, useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  actionType: ActionType;
  artifactId: Scalars["uuid"] | null;
  loanId: Scalars["uuid"] | null;
  handleClose: () => void;
}

function CreateUpdatePurchaseOrderLoanModal({
  actionType,
  artifactId = null, // this is passed in when a user clicks "Fund" from the Purchase Orders grid
  loanId = null,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  // Default Loan for CREATE case.
  const newLoan: LoansInsertInput = {
    artifact_id: artifactId || "",
    loan_type: LoanTypeEnum.PurchaseOrder,
    requested_payment_date: null,
    amount: "",
    status: LoanStatusEnum.Drafted,
  };

  const [loan, setLoan] = useState(newLoan);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  const { loading: isExistingLoanLoading } = useGetLoanForCustomerQuery({
    skip: actionType === ActionType.New,
    variables: {
      id: loanId,
    },
    onCompleted: (data) => {
      const existingLoan = data.loans_by_pk;
      if (actionType === ActionType.Update && existingLoan) {
        setLoan(
          mergeWith(newLoan, existingLoan, (a, b) => (isNull(b) ? a : b))
        );
      }
    },
  });

  let amountUsedOnArtifact = 0.0;
  let totalAmountForArtifact = 0.0;
  let totalAmountAvailableOnArtifact = 0.0;
  const idToArtifact: { [artifact_id: string]: Artifact } = {};

  for (let i = 0; i < artifacts.length; i++) {
    const artifact = artifacts[i];
    idToArtifact[artifact.artifact_id] = artifact;
  }
  if (artifacts && loan.artifact_id in idToArtifact) {
    const curArtifact = idToArtifact[loan.artifact_id];
    amountUsedOnArtifact =
      curArtifact.total_amount - curArtifact.amount_remaining;
    totalAmountForArtifact = curArtifact.total_amount;
    totalAmountAvailableOnArtifact =
      totalAmountForArtifact - amountUsedOnArtifact;
  }

  // NOTE: This query implicitly has the companyId specified due to the table presets in Hasura
  const {
    data,
    loading: isApprovedPurchaseOrdersLoading,
  } = useApprovedPurchaseOrdersQuery({
    fetchPolicy: "network-only",
  });

  const proposedLoansTotalAmount =
    amountUsedOnArtifact + parseFloat(loan?.amount) || 0;

  const approvedPurchaseOrders = data?.purchase_orders || [];

  const selectedPurchaseOrder = approvedPurchaseOrders.find(
    (purchaseOrder) => purchaseOrder.id === loan.artifact_id
  );

  useEffect(() => {
    async function loadArtifacts() {
      const resp = await listArtifactsForCreateLoan({
        product_type: ProductTypeEnum.InventoryFinancing,
        company_id: companyId,
        loan_id: loanId,
      });
      if (resp.status !== "OK") {
        snackbar.showMessage(resp.msg);
        return;
      }
      setArtifacts(resp.artifacts);

      if (artifactId) {
        const selectedArtifact = resp.artifacts.find((artifact) => {
          return artifact.artifact_id === artifactId;
        });
        if (selectedArtifact) {
          setLoan((loan) => {
            return {
              ...loan,
              amount: selectedArtifact.amount_remaining,
            };
          });
        }
      }
    }
    loadArtifacts();
  }, [snackbar, companyId, loanId, artifactId]);

  const [addLoan, { loading: isAddLoanLoading }] = useAddLoanMutation();

  const [
    updateLoan,
    { loading: isUpdateLoanLoading },
  ] = useUpdateLoanMutation();

  const [submitLoan, { loading: isSubmitLoanLoading }] = useCustomMutation(
    submitLoanMutation
  );

  const [
    getCompanyNextLoanIdentifier,
  ] = useGetCompanyNextLoanIdentifierMutation();

  const getNextLoanIdentifierByCompanyId = async () => {
    const response = await getCompanyNextLoanIdentifier({
      variables: {
        companyId,
        increment: { latest_loan_identifier: 1 },
      },
    });
    return response.data?.update_companies_by_pk?.latest_loan_identifier;
  };

  const upsertPurchaseOrderLoan = async () => {
    if (actionType === ActionType.Update) {
      const response = await updateLoan({
        variables: {
          id: loan.id,
          loan: {
            requested_payment_date: loan.requested_payment_date || null,
            amount: loan.amount || null,
          },
        },
      });
      return response.data?.update_loans_by_pk;
    } else {
      const nextLoanIdentifier = await getNextLoanIdentifierByCompanyId();
      if (!nextLoanIdentifier) {
        snackbar.showError("Error! Something went wrong.");
      } else {
        const response = await addLoan({
          variables: {
            loan: {
              identifier: nextLoanIdentifier.toString(),
              loan_type: LoanTypeEnum.PurchaseOrder,
              artifact_id: loan.artifact_id,
              requested_payment_date: loan.requested_payment_date || null,
              amount: loan.amount || null,
            },
          },
        });
        return response.data?.insert_loans_one;
      }
    }
  };

  const handleClickSaveDraft = async () => {
    const savedLoan = await upsertPurchaseOrderLoan();
    if (!savedLoan) {
      alert("Could not upsert loan");
    } else {
      snackbar.showSuccess("Success! Loan saved as draft.");
      handleClose();
    }
  };

  const handleClickSaveSubmit = async () => {
    const savedLoan = await upsertPurchaseOrderLoan();
    if (!savedLoan) {
      alert("Could not upsert loan");
    } else {
      // Since this is a SAVE AND SUBMIT action,
      // hit the PurchaseOrderLoans.SubmitForApproval endpoint.
      const response = await submitLoan({
        variables: {
          loan_id: savedLoan.id,
        },
      });
      if (response.status !== "OK") {
        snackbar.showError(
          `Error! Could not submit loan. Reason: ${response.msg}`
        );
      } else {
        snackbar.showSuccess(
          "Success! Loan saved and submitted to Bespoke. You may view this advance request in the Loans section."
        );
        handleClose();
      }
    }
  };

  const isDialogReady =
    !isExistingLoanLoading && !isApprovedPurchaseOrdersLoading;
  const isFormValid = !!loan.artifact_id;
  const isFormLoading =
    isAddLoanLoading || isUpdateLoanLoading || isSubmitLoanLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;

  const disabledSubmitReasons = [];
  if (!isFormValid || !selectedPurchaseOrder) {
    disabledSubmitReasons.push("Purchase order has not been selected");
  }
  if (isFormLoading) {
    disabledSubmitReasons.push("Data is loading");
  }
  if (proposedLoansTotalAmount > totalAmountForArtifact) {
    disabledSubmitReasons.push(
      "Requested total exceeds amount available on this purchase order. The total principal against this purchase order would be " +
        formatCurrency(proposedLoansTotalAmount) +
        " versus the " +
        formatCurrency(totalAmountForArtifact) +
        " allowed"
    );
  }
  if (!loan?.requested_payment_date) {
    disabledSubmitReasons.push("Requested payment date is not set");
  }
  if (!loan?.amount) {
    disabledSubmitReasons.push("Amount is not specified");
  }

  const isSaveSubmitDisabled = disabledSubmitReasons.length > 0;
  // If the purchase order ID is being passed in through the props, this means that the
  // user cannot select a purchase order themselves.
  const disablePurchaseOrderEditing = artifactId !== null;
  const canCreateLoanFromPurchaseOrdrer = totalAmountAvailableOnArtifact > 0;
  const noPurchaseOrderSelected = artifactId === null;
  const canCreateLoan =
    canCreateLoanFromPurchaseOrdrer || noPurchaseOrderSelected;

  return isDialogReady ? (
    <>
      {!canCreateLoan && (
        <Dialog
          open
          onClose={handleClose}
          maxWidth="xl"
          classes={{ paper: classes.dialog }}
        >
          <DialogTitle className={classes.dialogTitle}>
            Cannot create loan
          </DialogTitle>
          <DialogContent>
            <Box mt={1}>
              <Alert severity="warning">
                <span>
                  The maximum amount has been requested for this purchase order.
                  You may close this dialog and create a different purchase
                  order to create advances off of.
                </span>
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Box>
              <Button onClick={handleClose}>Cancel</Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
      {canCreateLoan && (
        <Dialog
          open
          onClose={handleClose}
          maxWidth="xl"
          classes={{ paper: classes.dialog }}
        >
          <DialogTitle className={classes.dialogTitle}>
            {`${
              actionType === ActionType.Update ? "Edit" : "Create"
            } Inventory Loan`}
          </DialogTitle>
          <DialogContent>
            <PurchaseOrderLoanForm
              canEditPurchaseOrder={
                actionType === ActionType.New && !disablePurchaseOrderEditing
              }
              loan={loan}
              setLoan={setLoan}
              approvedPurchaseOrders={approvedPurchaseOrders}
              selectedPurchaseOrder={selectedPurchaseOrder}
              idToArtifact={idToArtifact}
            />
            {disabledSubmitReasons.length > 0 && (
              <Box mt={1}>
                <Alert severity="warning">
                  <span>
                    Reasons you cannot submit, but can only save this as a draft
                  </span>
                  <br />
                  <div>
                    <ul>
                      {disabledSubmitReasons.map((reason, index) => {
                        return (
                          <li key={"disabled-reason-" + index}>{reason}</li>
                        );
                      })}
                    </ul>
                  </div>
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Box>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                disabled={isSaveDraftDisabled}
                onClick={handleClickSaveDraft}
                variant={"contained"}
                color={"secondary"}
              >
                Save as Draft
              </Button>
              <Button
                className={classes.submitButton}
                disabled={isSaveSubmitDisabled}
                onClick={handleClickSaveSubmit}
                variant="contained"
                color="primary"
              >
                Save and Submit
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </>
  ) : null;
}

export default CreateUpdatePurchaseOrderLoanModal;

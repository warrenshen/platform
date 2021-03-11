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
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LoansInsertInput,
  LoanStatusEnum,
  LoanTypeEnum,
  ProductTypeEnum,
  Scalars,
  useAddLoanMutation,
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
import { useContext, useEffect, useMemo, useState } from "react";
import ArtifactLoanForm, { ArtifactListItem } from "./ArtifactLoanForm";
import { IdComponent } from "./interfaces";

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
  approvedArtifacts: ArtifactListItem[];
  loanId: Scalars["uuid"] | null;
  loanType: LoanTypeEnum;
  InfoCard: IdComponent;
  handleClose: () => void;
}

export default function CreateUpdateArtifactLoanModal({
  actionType,
  artifactId,
  approvedArtifacts,
  loanId,
  loanType,
  InfoCard,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    user: { companyId, productType },
  } = useContext(CurrentUserContext);

  const artifactCopyLower = getProductTypeCopy(productType!);
  const artifactCopyUpper = capsFirst(artifactCopyLower);

  // Default Loan for CREATE case.
  const newLoan: LoansInsertInput = {
    artifact_id: artifactId || "",
    loan_type: loanType,
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

  const idToArtifact: { [artifact_id: string]: Artifact } = useMemo(
    () =>
      artifacts.reduce(
        (m, a) => ({
          ...m,
          [a.artifact_id]: a,
        }),
        {}
      ),
    [artifacts]
  );

  const selectedArtifact = idToArtifact[loan.artifact_id];

  if (selectedArtifact) {
    amountUsedOnArtifact =
      selectedArtifact.total_amount - selectedArtifact.amount_remaining;
    totalAmountForArtifact = selectedArtifact.total_amount;
    totalAmountAvailableOnArtifact =
      totalAmountForArtifact - amountUsedOnArtifact;
  }

  const proposedLoansTotalAmount =
    amountUsedOnArtifact + parseFloat(loan?.amount) || 0;

  useEffect(() => {
    async function loadArtifacts() {
      const resp = await listArtifactsForCreateLoan({
        product_type: productType!,
        company_id: companyId,
        loan_id: loanId,
      });
      if (resp.status !== "OK") {
        snackbar.showMessage(resp.msg);
        return;
      }

      setArtifacts(resp.artifacts);

      if (artifactId) {
        const artifact = resp.artifacts.find((artifact) => {
          return artifact.artifact_id === artifactId;
        });
        if (artifact) {
          setLoan((loan) => {
            return {
              ...loan,
              amount: artifact.amount_remaining,
            };
          });
        }
      }
    }
    loadArtifacts();
  }, [snackbar, companyId, loanId, artifactId, productType]);

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

  const upsertArtifactLoan = async () => {
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
              loan_type: loanType,
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
    const savedLoan = await upsertArtifactLoan();
    if (!savedLoan) {
      alert("Could not upsert loan");
    } else {
      snackbar.showSuccess("Success! Loan saved as draft.");
      handleClose();
    }
  };

  const handleClickSaveSubmit = async () => {
    const savedLoan = await upsertArtifactLoan();
    if (!savedLoan) {
      alert("Could not upsert loan");
    } else {
      // Since this is a SAVE AND SUBMIT action,
      // hit the SubmitForApproval endpoint.
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

  const isDialogReady = !isExistingLoanLoading;
  const isFormValid = !!loan.artifact_id;
  const isFormLoading =
    isAddLoanLoading || isUpdateLoanLoading || isSubmitLoanLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;

  const disabledSubmitReasons = [];
  if (!isFormValid || !selectedArtifact) {
    disabledSubmitReasons.push(`${artifactCopyUpper} has not been selected`);
  }
  if (isFormLoading) {
    disabledSubmitReasons.push("Data is loading");
  }
  if (proposedLoansTotalAmount > totalAmountForArtifact) {
    disabledSubmitReasons.push(
      `Requested total exceeds amount available on this ${artifactCopyLower}. The total principal against this ${artifactCopyLower} would be ` +
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
  const disableArtifactEditing = artifactId !== null;
  const canCreateLoanFromArtifact = totalAmountAvailableOnArtifact > 0;
  const noArtifactSelected = artifactId === null;
  const canCreateLoan =
    (canCreateLoanFromArtifact || noArtifactSelected) &&
    approvedArtifacts.length > 0;

  // Return null when we aren't yet ready
  if (!isDialogReady) {
    return null;
  }

  // Render a prompt that just tells folks they can't take out new loans against
  // this artifact
  if (!canCreateLoan) {
    return (
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
                The maximum amount has been requested for this{" "}
                {artifactCopyLower} or it is not yet approved. You may close
                this dialog and create a different {artifactCopyLower}
                to create advances off of.
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
    );
  }

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {`${
          actionType === ActionType.Update ? "Edit" : "Create"
        } ${getProductTypeLoanTitle(productType!)}`}
      </DialogTitle>
      <DialogContent>
        <ArtifactLoanForm
          artifactTitle={getProductTypeArtifactTitle(productType!)}
          canEditArtifact={
            actionType === ActionType.New && !disableArtifactEditing
          }
          loan={loan}
          setLoan={setLoan}
          approvedArtifacts={approvedArtifacts}
          selectedArtifact={selectedArtifact}
          idToArtifact={idToArtifact}
          InfoCard={InfoCard}
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
                    return <li key={"disabled-reason-" + index}>{reason}</li>;
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
  );
}

const getProductTypeCopy = (productType: ProductTypeEnum) => {
  switch (productType) {
    case ProductTypeEnum.InventoryFinancing:
      return "purchase order";
    case ProductTypeEnum.InvoiceFinancing:
      return "invoice";
    default:
      return "artifact";
  }
};

const getProductTypeLoanTitle = (productType: ProductTypeEnum) => {
  switch (productType) {
    case ProductTypeEnum.InventoryFinancing:
      return "Inventory Loan";
    case ProductTypeEnum.InvoiceFinancing:
      return "Invoice Loan";
    default:
      return "Artifact Loan";
  }
};

const getProductTypeArtifactTitle = (productType: ProductTypeEnum) => {
  switch (productType) {
    case ProductTypeEnum.InventoryFinancing:
      return "Purchase Order";
    case ProductTypeEnum.InvoiceFinancing:
      return "Invoice";
    default:
      return "Artifact";
  }
};

const capsFirst = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  LoansInsertInput,
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
import { submitLoanMutation, deleteLoanMutation } from "lib/api/loans";
import { formatCurrency } from "lib/currency";
import { ActionType, LoanStatusEnum } from "lib/enum";
import {
  Artifact,
  listArtifactsForCreateLoan,
} from "lib/finance/loans/artifacts";
import { isNull, mergeWith } from "lodash";
import { useContext, useEffect, useMemo, useState } from "react";
import ArtifactLoanForm, { ArtifactListItem } from "./ArtifactLoanForm";
import { IdComponent } from "./interfaces";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  artifactId: Scalars["uuid"] | null;
  approvedArtifacts: ArtifactListItem[];
  loanId: Scalars["uuid"] | null;
  loanType: LoanTypeEnum;
  InfoCard: IdComponent;
  handleClose: () => void;
}

export default function CreateUpdateArtifactLoanModal({
  actionType,
  companyId,
  productType,
  artifactId,
  approvedArtifacts,
  loanId,
  loanType,
  InfoCard,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const artifactCopyLower = getProductTypeCopy(productType);
  const artifactCopyUpper = capsFirst(artifactCopyLower);

  // Default Loan for CREATE case.
  const newLoan: LoansInsertInput = {
    artifact_id: artifactId || "",
    loan_type: loanType,
    requested_payment_date: null,
    amount: null,
    status: LoanStatusEnum.Drafted,
  };

  const [loan, setLoan] = useState(newLoan);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  const { loading: isExistingLoanLoading } = useGetLoanForCustomerQuery({
    skip: actionType === ActionType.New,
    fetchPolicy: "network-only",
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

  const [deleteLoan, { loading: isDeleteLoanLoading }] = useCustomMutation(
    deleteLoanMutation
  );

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

  if (!!selectedArtifact) {
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
    if (loan.id) {
      // If the loan already has a UUID, then it exists in the DB already.
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
        snackbar.showError(
          "Error! Something went wrong while saving the loan draft."
        );
      } else {
        const response = await addLoan({
          variables: {
            loan: {
              company_id: isBankUser ? companyId : undefined,
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
      snackbar.showError(`Could not upsert loan.`);
    } else {
      snackbar.showSuccess("Loan saved as draft.");
      handleClose();
    }
  };

  const handleClickSaveSubmit = async () => {
    const nextLoanIdentifier = await getNextLoanIdentifierByCompanyId();
    if (!nextLoanIdentifier) {
      snackbar.showError(
        "Error! Something went wrong while preparing the loan submission."
      );
    } else {
      const addLoanResponse = await addLoan({
        variables: {
          loan: {
            company_id: isBankUser ? companyId : undefined,
            identifier: nextLoanIdentifier.toString(),
            loan_type: loanType,
            artifact_id: loan.artifact_id,
            requested_payment_date: loan.requested_payment_date || null,
            amount: loan.amount || null,
          },
        },
      });

      if (!addLoanResponse.data?.insert_loans_one) {
        snackbar.showError(`Error! Could not add new loan. Please try again.`);
      } else {
        const loanToSubmitID = addLoanResponse.data?.insert_loans_one.id;

        const response = await submitLoan({
          variables: {
            loan_id: loanToSubmitID,
          },
        });
        if (response.status !== "OK") {
          snackbar.showError(`Could not submit loan. Reason: ${response.msg}`);

          // In addition to alerting the user, we should clean up the loan we set up
          // for submission. If the user fixes the error, we simply create a new loan
          // for submission
          await deleteLoan({
            variables: {
              loan_id: loanToSubmitID,
            },
          });
        } else {
          snackbar.showSuccess(
            "Loan saved and submitted to Bespoke - you may view this financing request on the Loans page."
          );
          handleClose();
        }
      }
    }
  };

  const isDialogReady = !isExistingLoanLoading;
  const isFormValid = !!loan.artifact_id;
  const isFormLoading =
    isAddLoanLoading ||
    isUpdateLoanLoading ||
    isSubmitLoanLoading ||
    isDeleteLoanLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;

  const disabledSubmitReasons = [];
  if (!isFormValid || !selectedArtifact) {
    disabledSubmitReasons.push(`${artifactCopyUpper} has not been selected`);
  }
  if (!!selectedArtifact && proposedLoansTotalAmount > totalAmountForArtifact) {
    disabledSubmitReasons.push(
      `Requested amount exceeds amount available to finance. The amount available to finance is ${formatCurrency(
        selectedArtifact.amount_remaining
      )}.`
    );
  }

  if (!loan?.requested_payment_date) {
    disabledSubmitReasons.push("Requested Payment Date is not set");
  }
  if (!loan?.amount) {
    disabledSubmitReasons.push("Amount is not specified");
  }

  const isSaveSubmitDisabled =
    isSaveDraftDisabled || disabledSubmitReasons.length > 0;

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
      <Modal
        title={"Cannot create loan"}
        handleClose={handleClose}
        primaryActionText={"Close"}
        handlePrimaryAction={handleClose}
      >
        <Box mt={1}>
          <Alert severity="warning">
            <span>
              There is no remaining amount on this {artifactCopyLower} to
              request a loan with. Please select a different {artifactCopyLower}
              .
            </span>
          </Alert>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal
      isPrimaryActionDisabled={isSaveSubmitDisabled}
      isSecondaryActionDisabled={isSaveDraftDisabled}
      title={
        actionType === ActionType.Update ? "Edit Loan" : "Request New Loan"
      }
      primaryActionText={"Save and Submit"}
      secondaryActionText={"Save as Draft"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSaveSubmit}
      handleSecondaryAction={handleClickSaveDraft}
    >
      {isBankUser && (
        <Box mt={2} mb={6}>
          <Alert severity="warning">
            <Typography variant="body1">
              {`Warning: you are ${
                actionType === ActionType.Update ? "editing" : "requesting"
              } a loan on behalf of this
                customer (only bank admins can do this).`}
            </Typography>
          </Alert>
        </Box>
      )}
      <ArtifactLoanForm
        canEditArtifact={
          actionType === ActionType.New && !disableArtifactEditing
        }
        artifactTitle={getProductTypeArtifactTitle(productType!)}
        productType={productType}
        loan={loan}
        setLoan={setLoan}
        approvedArtifacts={approvedArtifacts}
        selectedArtifact={selectedArtifact}
        idToArtifact={idToArtifact}
        InfoCard={InfoCard}
      />
      {disabledSubmitReasons.length > 0 && (
        <Box mt={4}>
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
    </Modal>
  );
}

const getProductTypeCopy = (productType: ProductTypeEnum) => {
  switch (productType) {
    case ProductTypeEnum.InventoryFinancing:
    case ProductTypeEnum.PurchaseMoneyFinancing:
      return "purchase order";
    case ProductTypeEnum.InvoiceFinancing:
      return "invoice";
    default:
      return "artifact";
  }
};

const getProductTypeArtifactTitle = (productType: ProductTypeEnum) => {
  switch (productType) {
    case ProductTypeEnum.InventoryFinancing:
    case ProductTypeEnum.PurchaseMoneyFinancing:
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

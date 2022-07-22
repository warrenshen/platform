import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import ArtifactLoanForm from "components/Artifacts/ArtifactLoanForm";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  LoanTypeEnum,
  LoansInsertInput,
  Scalars,
  useGetLoanForCustomerQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { saveLoanMutation, submitLoanMutation } from "lib/api/loans";
import {
  ActionType,
  LoanStatusEnum,
  ProductTypeEnum,
  ProductTypeToArtifactType,
} from "lib/enum";
import { Artifact } from "lib/finance/loans/artifacts";
import { formatCurrency } from "lib/number";
import { isNull, mergeWith } from "lodash";
import { useContext, useMemo, useState } from "react";

import { IdComponent } from "./interfaces";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  artifactId: Scalars["uuid"] | null;
  artifacts: Artifact[];
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
  artifacts,
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

  const defaultLoan: LoansInsertInput = {
    artifact_id: artifactId || "",
    loan_type: loanType,
    requested_payment_date: null,
    amount: null,
    status: LoanStatusEnum.Drafted,
  };

  const [loan, setLoan] = useState<LoansInsertInput>(defaultLoan);

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
          mergeWith(defaultLoan, existingLoan, (a, b) => (isNull(b) ? a : b))
        );
      }
    },
  });

  const [saveLoan, { loading: isSaveLoanLoading }] =
    useCustomMutation(saveLoanMutation);

  const [submitLoan, { loading: isSubmitLoanLoading }] =
    useCustomMutation(submitLoanMutation);

  const idToArtifact: { [artifact_id: string]: Artifact } = useMemo(
    () =>
      artifacts.reduce(
        (m, a) => ({
          ...m,
          [a.id]: a,
        }),
        {}
      ),
    [artifacts]
  );

  const selectedArtifact = artifacts.find(
    (artifact) => artifact.id === artifactId
  );

  const amountUsedOnArtifact = !!selectedArtifact
    ? selectedArtifact.total_amount - selectedArtifact.amount_remaining
    : 0;
  const totalAmountForArtifact = !!selectedArtifact
    ? selectedArtifact.total_amount
    : 0;
  const totalAmountAvailableOnArtifact = !!selectedArtifact
    ? totalAmountForArtifact - amountUsedOnArtifact
    : 0;

  const proposedLoansTotalAmount =
    amountUsedOnArtifact + parseFloat(loan?.amount) || 0;

  const handleClickSaveDraft = async () => {
    const response = await saveLoan({
      variables: {
        amount: loan.amount,
        artifact_id: loan.artifact_id,
        company_id: companyId,
        loan_id: loanId,
        loan_type: loan.loan_type,
        requested_payment_date: loan.requested_payment_date,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Successfully saved loans");
      handleClose();
    }
  };

  const handleClickSaveSubmit = async () => {
    const response = await submitLoan({
      variables: {
        amount: loan.amount,
        artifact_id: loan.artifact_id,
        company_id: companyId,
        loan_id: loanId,
        loan_type: loan.loan_type,
        requested_payment_date: loan.requested_payment_date,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Successfully submitted loans");
      handleClose();
    }
  };

  const isDialogReady = !isExistingLoanLoading;
  const isFormValid = !!loan.artifact_id;
  const isFormLoading = isSaveLoanLoading || isSubmitLoanLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;

  const disabledSubmitReasons = [];
  if (!isFormValid) {
    disabledSubmitReasons.push(
      `You must select the ${ProductTypeToArtifactType[
        productType
      ].toLowerCase()} for the loan before submitting.`
    );
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

  const isSaveSubmitDisabled = disabledSubmitReasons.length > 0;

  // If the purchase order ID is being passed in through the props, this means that the
  // user cannot select a purchase order themselves.
  const disableArtifactEditing = artifactId !== null;
  const canCreateLoanFromArtifact = totalAmountAvailableOnArtifact > 0;
  const noArtifactSelected = artifactId === null;
  const canCreateLoan =
    (canCreateLoanFromArtifact || noArtifactSelected) && artifacts.length > 0;

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
              There is no remaining amount on this{" "}
              {ProductTypeToArtifactType[productType].toLowerCase()} to request
              a loan with. Please select a different{" "}
              {ProductTypeToArtifactType[productType].toLowerCase()}.
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
        artifactTitle={ProductTypeToArtifactType[productType]}
        productType={productType}
        loan={loan}
        setLoan={setLoan}
        approvedArtifacts={artifacts}
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

import { Box, Theme, createStyles, makeStyles } from "@material-ui/core";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import Modal from "components/Shared/Modal/Modal";
import { Loans, useGetDebtFacilityLoansByIdQuery } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { updateDebtFacilityAssignedDate } from "lib/api/debtFacility";
import { todayAsDateStringServer } from "lib/date";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  selectedLoanIds?: Loans["id"][];
  handleClose: () => void;
}

export default function MoveDebtFacilityLoanModal({
  selectedLoanIds,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [debtFacilityAssignedDate, setDebtFacilityAssignedDate] = useState("");

  const { data, error } = useGetDebtFacilityLoansByIdQuery({
    skip: !selectedLoanIds,
    variables: {
      loan_ids: selectedLoanIds,
      target_date: todayAsDateStringServer(),
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }
  const companies = data?.companies || [];
  const companyInfoLookup = Object.assign(
    {},
    ...companies.map((company) => {
      return {
        [company.id]: (({ loans, ...c }) => c)(company),
      };
    })
  );
  const selectedLoans = companies.flatMap((company) => {
    return company.loans;
  });

  const [updateAssignedDate, { loading: isUpdateAssignedDateLoading }] =
    useCustomMutation(updateDebtFacilityAssignedDate);

  // Submission Handler
  const handleClick = async () => {
    const loanIds = selectedLoans.map((loan) => loan.id);
    const response = await updateAssignedDate({
      variables: {
        newAssignedDate: debtFacilityAssignedDate,
        loanIds: loanIds,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Successfully updated assigned date");
      handleClose();
    }
  };

  return (
    <Modal
      dataCy={"move-debt-facility-loan-modal"}
      isPrimaryActionDisabled={
        debtFacilityAssignedDate === "" || isUpdateAssignedDateLoading
      }
      title={"Update When Loan Was Assigned to Debt Facility"}
      contentWidth={800}
      primaryActionText={"Submit Assigned Date Update"}
      handleClose={handleClose}
      handlePrimaryAction={() => handleClick()}
    >
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mt={2}>
          <DateInput
            disableNonBankDays
            className={classes.inputField}
            id="debt-facility-assignment-date-picker"
            label="Assignment Date"
            value={debtFacilityAssignedDate}
            onChange={(value) => setDebtFacilityAssignedDate(value || "")}
          />
        </Box>
      </Box>
      <Box mt={4}>
        <DebtFacilityLoansDataGrid
          loans={selectedLoans}
          companyInfoLookup={companyInfoLookup}
          isDebtFacilityVisible
          isExcelExport={false}
        />
      </Box>
    </Modal>
  );
}

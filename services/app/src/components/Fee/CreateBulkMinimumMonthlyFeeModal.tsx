import Modal from "components/Shared/Modal/Modal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  getAllMonthlyFeesDueQuery,
  submitAllMonthlyFeesDueMutation,
} from "lib/api/fees";
import { useState } from "react";
import { Box } from "@material-ui/core";
import DateInput from "components/Shared/FormInputs/DateInput";

interface Props {
  handleClose: () => void;
}

// Only bank users can create an account level fee.
export default function CreateBulkMinimumMonthlyFeeModal({
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [dateStr, setDateStr] = useState<string>("");
  const [isOnConfirmationPage, setIsOnConfirmationPage] = useState<boolean>(
    false
  );
  const [monthlyDuesResp, setMonthlyDueResp] = useState<any>(null);

  const [
    getAllMonthlyFeesDue,
    { loading: isGetAllMonthlyFeesDueLoading },
  ] = useCustomMutation(getAllMonthlyFeesDueQuery);

  const [
    submitAllMonthlyFeesDue,
    { loading: isSubmitAllMonthlyFeesDueLoading },
  ] = useCustomMutation(submitAllMonthlyFeesDueMutation);

  const handleClickNext = async () => {
    const response = await getAllMonthlyFeesDue({
      variables: {
        date: dateStr,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else {
      window.console.log(response);
      setIsOnConfirmationPage(true);
      setMonthlyDueResp(response.data);
    }
  };

  const handleClickSubmit = async () => {
    const response = await submitAllMonthlyFeesDue({
      variables: {
        date: dateStr,
        monthly_due_resp: monthlyDuesResp,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else {
      snackbar.showSuccess(
        "Fees created for customers who have monthly, quarterly or annual minimums."
      );
      handleClose();
    }
  };

  const isNextDisabled =
    !isOnConfirmationPage &&
    (dateStr.length === 0 || isGetAllMonthlyFeesDueLoading);

  const isSubmitDisabled =
    isOnConfirmationPage && isSubmitAllMonthlyFeesDueLoading;

  return (
    <Modal
      isPrimaryActionDisabled={isNextDisabled || isSubmitDisabled}
      title={"Create Minimum Monthly Fee For All Customers"}
      contentWidth={800}
      primaryActionText={isOnConfirmationPage ? "Submit" : "Next"}
      handleClose={handleClose}
      handlePrimaryAction={
        isOnConfirmationPage ? handleClickSubmit : handleClickNext
      }
    >
      <Box display="flex" flexDirection="column">
        {!isOnConfirmationPage && (
          <Box>
            <Box display="flex" flexDirection="column" mt={4}>
              <DateInput
                disableNonBankDays
                id="choose-month-date-picker"
                label="Choose Month"
                value={dateStr}
                onChange={(value) => setDateStr(value as string)}
              />
            </Box>
          </Box>
        )}
        {isOnConfirmationPage && <Box>Table to show</Box>}
      </Box>
    </Modal>
  );
}

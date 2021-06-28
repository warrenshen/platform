import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  getAllMonthlyFeesDueQuery,
  submitAllMonthlyFeesDueMutation,
} from "lib/api/fees";
import { useState } from "react";
import MinimumMonthlyFeesDataGrid from "components/Fee/MinimumMonthlyFeesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import { formatDateStringAsMonth } from "lib/date";

interface Props {
  handleClose: () => void;
}

export default function CreateMinimumInterestFeesModal({ handleClose }: Props) {
  const snackbar = useSnackbar();

  const [dateStr, setDateStr] = useState<string>("");
  const [isOnConfirmationPage, setIsOnConfirmationPage] = useState<boolean>(
    false
  );
  const [monthlyFeesDueResp, setMonthlyFeesDueResp] = useState<any>(null);

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
      setMonthlyFeesDueResp(response.data);
      setIsOnConfirmationPage(true);
    }
  };

  const handleClickSubmit = async () => {
    const response = await submitAllMonthlyFeesDue({
      variables: {
        date: dateStr,
        monthly_due_resp: monthlyFeesDueResp,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else {
      snackbar.showSuccess(
        "Fees created for customers who have monthly, quarterly or annual interest minimums."
      );
      handleClose();
    }
  };

  const isNextDisabled =
    !isOnConfirmationPage &&
    (dateStr.length === 0 || isGetAllMonthlyFeesDueLoading);

  const isSubmitDisabled =
    isOnConfirmationPage && isSubmitAllMonthlyFeesDueLoading;

  const companyIdToMonthlyFeesDue =
    monthlyFeesDueResp?.company_due_to_financial_info || {};
  const minimumMonthlyFees = Object.keys(companyIdToMonthlyFeesDue).map(
    (companyId) => {
      const minimumMonthlyFeePayload = companyIdToMonthlyFeesDue[companyId];
      return minimumMonthlyFeePayload;
    }
  );

  return (
    <Modal
      isPrimaryActionDisabled={isNextDisabled || isSubmitDisabled}
      title={"Create Minimum Interest Fees For Month"}
      primaryActionText={isOnConfirmationPage ? "Submit" : "Next"}
      secondaryActionText={
        isOnConfirmationPage ? "Back to previous step" : null
      }
      contentWidth={600}
      handleClose={handleClose}
      handlePrimaryAction={
        isOnConfirmationPage ? handleClickSubmit : handleClickNext
      }
      handleSecondaryAction={() => setIsOnConfirmationPage(false)}
    >
      <Box display="flex" flexDirection="column">
        {!isOnConfirmationPage ? (
          <Box>
            <Box>
              <Typography variant="body1">
                Select a month (any date in the month is fine) for which you'd
                like to create minimum interest fees for. For example if you'd
                like to create minimum interest fees for the month of May 2021,
                select 05/31/21.
              </Typography>
              <Box mt={2}>
                <Alert severity="warning">
                  Please ensure that customer financials are up-to-date and
                  correct (as of the month you selet) before you create minimum
                  fees with this tool.
                </Alert>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" mt={4}>
              <DateInput
                id="choose-month-date-picker"
                label="Choose Month"
                value={dateStr}
                onChange={(value) => setDateStr(value as string)}
              />
            </Box>
          </Box>
        ) : (
          <Box>
            <Box mt={2}>
              <Typography variant="body1">
                <b>{`Selected month: ${formatDateStringAsMonth(dateStr)}`}</b>
              </Typography>
            </Box>
            <Box mt={4}>
              <Typography variant="body1">
                Based on customer financials for the month you selected, here
                are the minimum interest fees to create. Please double check
                these values and press "Submit" to create these minimum interest
                fees.
              </Typography>
              <Box mt={2}>
                <Alert severity="warning">
                  Note: if you've previously created minimum interest fees for
                  the selected month, pressing "Submit" will create a duplicate
                  set of fees.
                </Alert>
              </Box>
            </Box>
            <MinimumMonthlyFeesDataGrid
              minimumMonthlyFees={minimumMonthlyFees}
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
}

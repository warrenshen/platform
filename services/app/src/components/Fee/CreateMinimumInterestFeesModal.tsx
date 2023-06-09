import { Box, Typography } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import { Alert } from "@material-ui/lab";
import MinimumInterestFeesDataGrid from "components/Fee/MinimumInterestFeesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import Modal from "components/Shared/Modal/Modal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  getAllMonthlyInterestFeesDueQuery,
  submitMinimumInterestFeesDueMutation,
} from "lib/api/fees";
import { formatDateStringAsMonth } from "lib/date";
import { sortBy } from "lodash";
import { useState } from "react";

interface Props {
  handleClose: () => void;
}

export default function CreateMinimumInterestFeesModal({ handleClose }: Props) {
  const snackbar = useSnackbar();

  const [dateStr, setDateStr] = useState<string>("");
  const [isOnConfirmationPage, setIsOnConfirmationPage] =
    useState<boolean>(false);
  const [minimumInterestFeesDuePayload, setMinimumInterestFeesDuePayload] =
    useState<any>(null);

  const [
    getAllMonthlyInterestFeesDue,
    { loading: isGetAllMonthlyFeesDueLoading },
  ] = useCustomMutation(getAllMonthlyInterestFeesDueQuery);

  const [
    submitMinimumInterestFeesDue,
    { loading: isSubmitAllMonthlyFeesDueLoading },
  ] = useCustomMutation(submitMinimumInterestFeesDueMutation);

  const handleClickNext = async () => {
    const response = await getAllMonthlyInterestFeesDue({
      variables: {
        date: dateStr,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else {
      setMinimumInterestFeesDuePayload(response.data);
      setIsOnConfirmationPage(true);
    }
  };

  const handleClickSubmit = async () => {
    const response = await submitMinimumInterestFeesDue({
      variables: {
        date: dateStr,
        monthly_due_resp: minimumInterestFeesDuePayload,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Minimum interest fees created for customers.");
      handleClose();
    }
  };

  const isNextDisabled =
    !isOnConfirmationPage &&
    (dateStr.length === 0 || isGetAllMonthlyFeesDueLoading);

  const isSubmitDisabled =
    isOnConfirmationPage && isSubmitAllMonthlyFeesDueLoading;

  const companyIdToMinimumInterestFeeDue =
    minimumInterestFeesDuePayload?.company_due_to_financial_info || {};
  const minimumInterestFeesDue = Object.keys(
    companyIdToMinimumInterestFeeDue
  ).map((companyId) => companyIdToMinimumInterestFeeDue[companyId]);
  const sortedMinimumInterestFeesDue = sortBy(
    minimumInterestFeesDue,
    (minimumInterestFeeDue) => minimumInterestFeeDue.company.name
  );

  return (
    <Modal
      isPrimaryActionDisabled={isNextDisabled || isSubmitDisabled}
      title={"Create Minimum Interest Fees"}
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
                  correct (as of the month you select) before you proceed.
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
                <strong>{`Selected month: ${formatDateStringAsMonth(
                  dateStr
                )}`}</strong>
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
            <MinimumInterestFeesDataGrid
              minimumInterestFees={sortedMinimumInterestFeesDue}
              actionItems={[
                {
                  key: "remove",
                  label: "Remove",
                  handleClick: (params: GridValueFormatterParams) => {
                    const companyId = params.row.data.id;
                    const newMinimumInterestFeesDuePayload = Object.assign(
                      {},
                      minimumInterestFeesDuePayload
                    );
                    delete newMinimumInterestFeesDuePayload
                      .company_due_to_financial_info[companyId];
                    setMinimumInterestFeesDuePayload(
                      newMinimumInterestFeesDuePayload
                    );
                  },
                },
              ]}
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
}

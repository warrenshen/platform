import { Box, Typography } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  getAllMonthEndPaymentsQuery,
  submitMonthEndPaymentsMutation,
} from "lib/api/fees";
import { useState } from "react";
import MonthEndPaymentsDataGrid from "components/Fee/MonthEndPaymentsDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import { formatDateStringAsMonth } from "lib/date";

interface Props {
  handleClose: () => void;
}

export default function CreateMonthEndPaymentsModal({ handleClose }: Props) {
  const snackbar = useSnackbar();

  const [dateStr, setDateStr] = useState<string>("");
  const [isOnConfirmationPage, setIsOnConfirmationPage] = useState<boolean>(
    false
  );
  const [monthEndPaymentsPayload, setMonthEndPaymentsPayload] = useState<any>(
    null
  );

  const [
    getAllMonthlyInterestFeesDue,
    { loading: isGetAllMonthlyFeesDueLoading },
  ] = useCustomMutation(getAllMonthEndPaymentsQuery);

  const [
    submitMonthEndPayments,
    { loading: isSubmitMonthEndPaymentsLoading },
  ] = useCustomMutation(submitMonthEndPaymentsMutation);

  const handleClickNext = async () => {
    const response = await getAllMonthlyInterestFeesDue({
      variables: {
        date: dateStr,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else {
      setMonthEndPaymentsPayload(response.data);
      setIsOnConfirmationPage(true);
    }
  };

  const handleClickSubmit = async () => {
    const response = await submitMonthEndPayments({
      variables: {
        date: dateStr,
        monthly_due_resp: monthEndPaymentsPayload,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(`Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Month-end payments created for customers.");
      handleClose();
    }
  };

  const isNextDisabled =
    !isOnConfirmationPage &&
    (dateStr.length === 0 || isGetAllMonthlyFeesDueLoading);

  const isSubmitDisabled =
    isOnConfirmationPage && isSubmitMonthEndPaymentsLoading;

  const companyIdToMonthEndPayment =
    monthEndPaymentsPayload?.company_due_to_financial_info || {};
  const monthEndPayments = Object.keys(companyIdToMonthEndPayment).map(
    (companyId) => companyIdToMonthEndPayment[companyId]
  );

  return (
    <Modal
      isPrimaryActionDisabled={isNextDisabled || isSubmitDisabled}
      title={"Create Month-End Payments For Month"}
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
                like to create month-end reverse draft ACH payments for. For
                example if you'd like to create the month-end payments for the
                month of May 2021, select 05/31/21.
              </Typography>
              <Box mt={2}>
                <Alert severity="warning">
                  Please ensure that customer financials are up-to-date and
                  correct (as of the month you select) before you create the
                  reverse draft ACHs with this tool.
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
                are the month-end reverse draft ACH payments to create. Please
                double check these values and press "Submit" to create these
                payments.
              </Typography>
              <Box mt={2}>
                <Alert severity="warning">
                  Note: if you've previously created month-end payments for the
                  selected month, pressing "Submit" will create a duplicate set
                  of payments.
                </Alert>
              </Box>
            </Box>
            <MonthEndPaymentsDataGrid
              monthEndPayments={monthEndPayments}
              actionItems={[
                {
                  key: "remove",
                  label: "Remove",
                  handleClick: (params: ValueFormatterParams) => {
                    const companyId = params.row.data.id;
                    const newMonthEndPaymentsPayload = Object.assign(
                      {},
                      monthEndPaymentsPayload
                    );
                    delete newMonthEndPaymentsPayload
                      .company_due_to_financial_info[companyId];
                    setMonthEndPaymentsPayload(newMonthEndPaymentsPayload);
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

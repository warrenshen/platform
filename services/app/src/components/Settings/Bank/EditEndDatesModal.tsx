import {
  Box,
  DialogActions,
  DialogContent,
  FormControl,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import DateInput from "components/Shared/FormInputs/DateInput";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import {
  CompanySettings,
  Maybe,
  useGetCompanySettingsQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { DateInputIcon } from "icons";
import { editEndDatesMutation } from "lib/api/settings";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
  })
);

interface Props {
  companySettingsId: CompanySettings["id"];
  handleClose: () => void;
}

export default function EditEndDatesModal({
  companySettingsId,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [interestEndDate, setInterestEndDate] = useState<Maybe<string>>(null);
  const [lateFeesEndDate, setLateFeesEndDate] = useState<Maybe<string>>(null);

  const { data, error } = useGetCompanySettingsQuery({
    fetchPolicy: "network-only",
    variables: {
      company_settings_id: companySettingsId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }
  const settings = data?.company_settings_by_pk || null;

  useEffect(() => {
    const initialInterestEndDate = settings?.interest_end_date || null;
    setInterestEndDate(initialInterestEndDate);

    const initialLateFeesEndDate = settings?.late_fees_end_date || null;
    setLateFeesEndDate(initialLateFeesEndDate);
  }, [settings]);

  const [editEndDates, { loading: isEditEndDatesLoading }] =
    useCustomMutation(editEndDatesMutation);

  const handleClickSubmit = async () => {
    const response = await editEndDates({
      variables: {
        company_settings_id: companySettingsId,
        interest_end_date: interestEndDate,
        late_fees_end_date: lateFeesEndDate,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Could not edit the company's end dates. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Successfully edited company's end dates");
      handleClose();
    }
  };

  const isSubmitDisabled = isEditEndDatesLoading;

  return (
    <ModalDialog title={"Edit Customer End Dates"} handleClose={handleClose}>
      <DialogContent>
        <Box display="flex" flexDirection="column" mb={2}>
          <FormControl fullWidth>
            <DateInput
              id="interest-end-date-date-picker"
              label="Interest End Date"
              value={interestEndDate}
              onChange={(value) => setInterestEndDate(value)}
              keyboardIcon={<DateInputIcon width="16px" height="16px" />}
            />
          </FormControl>
        </Box>
        <Box display="flex" flexDirection="column" mb={2}>
          <FormControl fullWidth>
            <DateInput
              id="late-fees-end-date-date-picker"
              label="Late Fees End Date"
              value={lateFeesEndDate}
              onChange={(value) => setLateFeesEndDate(value)}
              keyboardIcon={<DateInputIcon width="16px" height="16px" />}
            />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <SecondaryButton
          dataCy={"edit-end-dates-cancel-button"}
          text={"Cancel"}
          onClick={handleClose}
        />
        <PrimaryButton
          dataCy={"edit-end-dates-confirm-button"}
          isDisabled={isSubmitDisabled}
          text={"Confirm"}
          onClick={handleClickSubmit}
        />
      </DialogActions>
    </ModalDialog>
  );
}

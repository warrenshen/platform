import {
  Box,
  Button,
  Checkbox,
  createStyles,
  FormControlLabel,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import DateInput from "components/Shared/FormInputs/DateInput";
import { Companies } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import {
  downloadMetrcDataAllCompanies,
  downloadMetrcDataForCompany,
} from "lib/api/metrc";
import { todayAsDateStringServer } from "lib/date";
import { ChangeEvent, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 200,
    },
  })
);

interface Props {
  companyId: Companies["id"] | null; // If null, download Metrc data for ALL companies.
}

export default function SyncMetrcData({ companyId }: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [startDate, setStartDate] = useState<string>(todayAsDateStringServer());
  const [endDate, setEndDate] = useState<string>(todayAsDateStringServer());
  const [isSync, setIsSync] = useState<boolean>(false);

  const handleSubmit = async () => {
    const response = !!companyId
      ? await downloadMetrcDataForCompany({
          variables: {
            company_id: companyId,
            start_date: startDate,
            end_date: endDate,
            is_sync: isSync,
          },
        })
      : await downloadMetrcDataAllCompanies({ variables: {} });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not download data. Error: ${(response?.errors || []).join(", ")}`
      );
    } else {
      const msg = isSync
        ? "Metrc data downloaded successfully"
        : "Metrc download data job scheduled successfully";
      snackbar.showSuccess(msg);
    }
  };

  const isSubmitDisabled = false;

  return (
    <Box display="flex" flexDirection="column">
      <Box mb={2}>
        <Box mb={2}>
          <Typography color="textSecondary" variant="body2">
            Fetch information from Metrc by "last modified at" timestamp. For
            example, 06/14 - 06/18 as the date range will fetch information from
            Metrc that was last modified between 06/14 and 06/18.
          </Typography>
        </Box>
        {!!companyId && (
          <>
            <Box mb={2}>
              <DateInput
                className={classes.inputField}
                id="start-date-date-picker"
                label="Start Date"
                disableFuture
                value={startDate}
                onChange={(value) =>
                  setStartDate(value || todayAsDateStringServer())
                }
              />
            </Box>
            <Box mb={2}>
              <DateInput
                className={classes.inputField}
                id="end-date-date-picker"
                label="End Date"
                disableFuture
                value={endDate}
                onChange={(value) =>
                  setEndDate(value || todayAsDateStringServer())
                }
              />
            </Box>
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isSync}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setIsSync(event.target.checked)
                    }
                    color="primary"
                  />
                }
                label={"Run Immediately (Blocking)?"}
              />
            </Box>
          </>
        )}
        <Box>
          <Button
            disabled={isSubmitDisabled}
            variant="contained"
            color="primary"
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

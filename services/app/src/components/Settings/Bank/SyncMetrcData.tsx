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
import { syncMetrcDataPerCustomer } from "lib/api/metrc";
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
  companyId: Companies["id"];
}

export default function SyncMetrcData(props: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [startDate, setStartDate] = useState<string>(todayAsDateStringServer());
  const [endDate, setEndDate] = useState<string>(todayAsDateStringServer());
  const [useAsync, setUseAsync] = useState<boolean>(false);

  const handleSubmit = async () => {
    const response = await syncMetrcDataPerCustomer({
      variables: {
        start_date: startDate,
        end_date: endDate,
        company_id: props.companyId,
        use_async: useAsync,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not sync data. Error: ${(response?.errors || []).join(", ")}`
      );
    } else {
      const msg = useAsync ? "Metrc sync job scheduled" : "Metrc data synced";
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
            onChange={(value) => setEndDate(value || todayAsDateStringServer())}
          />
        </Box>
        <Box mt={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={useAsync}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setUseAsync(event.target.checked)
                }
                color="primary"
              />
            }
            label={"Run Async? [experimental]"}
          />
        </Box>
        <Box mt={1}>
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

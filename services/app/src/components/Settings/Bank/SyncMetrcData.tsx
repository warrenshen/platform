import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core";
import DateInput from "components/Shared/FormInputs/DateInput";
import useSnackbar from "hooks/useSnackbar";
import { Companies } from "generated/graphql";
import { syncMetrcDataPerCustomer } from "lib/api/metrc";
import { todayAsDateStringServer } from "lib/date";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",

      width: "100%",
    },
    section: {
      display: "flex",
      flexDirection: "column",
    },
    sectionSpace: {
      marginBottom: theme.spacing(4),
    },
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

  const handleSubmit = async () => {
    const response = await syncMetrcDataPerCustomer({
      variables: {
        start_date: startDate,
        end_date: endDate,
        company_id: props.companyId,
      },
    });

    if (response.status !== "OK") {
      console.error({ response });
      snackbar.showError(`Syncing data failed. Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Metrc data synced");
    }
  };

  const isSubmitDisabled = false;

  return (
    <Box className={classes.container}>
      <Box className={classes.section} mt={2}>
        <Box alignItems="right" mb={2}>
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
    </Box>
  );
}

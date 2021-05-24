import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core";
import DateInput from "components/Shared/FormInputs/DateInput";
import useSnackbar from "hooks/useSnackbar";
import { syncMetrcData } from "lib/api/metrc";
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
export default function SyncWithPlatformTab() {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [curDate, setCurDate] = useState<string>(todayAsDateStringServer());

  const handleSubmit = async () => {
    const response = await syncMetrcData({
      variables: {
        cur_date: curDate,
      },
    });

    if (response.status !== "OK") {
      console.log({ response });
      snackbar.showError("Syncing data failed");
    } else {
      snackbar.showSuccess("Metrc data synced");
    }
  };

  const isSubmitDisabled = false;

  return (
    <Box className={classes.container}>
      <Box className={classes.section} mt={4}>
        <Box display="flex" alignItems="right" mb={2}>
          <Box ml={2}>
            <DateInput
              className={classes.inputField}
              id="cur-date-date-picker"
              label="Date"
              disableFuture
              value={curDate}
              onChange={(value) =>
                setCurDate(value || todayAsDateStringServer())
              }
            />
          </Box>
          <Box ml={2}>
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
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          overflow="scroll"
        ></Box>
      </Box>
    </Box>
  );
}

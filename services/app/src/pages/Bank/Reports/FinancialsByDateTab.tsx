import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import FinancialSummariesDataGrid from "components/CustomerFinancialSummaries/FinancialSummariesDataGrid";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import { useGetFinancialSummariesByDateQuery } from "generated/graphql";
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
      width: 300,
    },
  })
);

function BankReportsPage() {
  const classes = useStyles();

  const [selectedDate, setSelectedDate] = useState(todayAsDateStringServer());

  const {
    data: financialSummariesByDateData,
    error: financialSummariesByDateError,
  } = useGetFinancialSummariesByDateQuery({
    fetchPolicy: "network-only",
    variables: {
      date: selectedDate,
    },
  });

  if (financialSummariesByDateError) {
    alert(
      "Error querying financial summaries by date. " +
        financialSummariesByDateError
    );
  }

  const financialSummariesByDate =
    financialSummariesByDateData?.financial_summaries || [];

  return (
    <Box className={classes.container}>
      <Box className={classes.section} mt={4}>
        <Box mb={2}>
          <DatePicker
            className={classes.inputField}
            id="report-date-date-picker"
            label="Report Date"
            disableFuture
            value={selectedDate}
            onChange={(value) =>
              setSelectedDate(value || todayAsDateStringServer())
            }
          />
        </Box>
        <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
          <FinancialSummariesDataGrid
            isExcelExport
            financialSummaries={financialSummariesByDate}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default BankReportsPage;

import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import FinancialSummariesDataGrid from "components/CustomerFinancialSummaries/FinancialSummariesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import { useGetFinancialSummariesByDateQuery } from "generated/graphql";
import { todayAsDateStringServer } from "lib/date";
import { useState } from "react";
import { useHistory } from "react-router-dom";

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

export default function BankReportsFinancialsByDateTab() {
  const classes = useStyles();
  const history = useHistory();

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
          <DateInput
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
            isCustomerNameFixed
            isExcelExport
            financialSummaries={financialSummariesByDate}
            onClickCustomerName={(customerId) =>
              history.push(`/customers/${customerId}/overview`)
            }
          />
        </Box>
      </Box>
    </Box>
  );
}

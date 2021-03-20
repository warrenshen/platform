import {
  Box,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from "@material-ui/core";
import FinancialSummariesDataGrid from "components/CustomerFinancialSummaries/FinancialSummariesDataGrid";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import Page from "components/Shared/Page";
import {
  Companies,
  useGetCustomersWithMetadataQuery,
  useGetFinancialSummariesByCompanyIdQuery,
  useGetFinancialSummariesByDateQuery,
} from "generated/graphql";
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
  const [companyId, setCompanyId] = useState<Companies["id"]>("");
  const [selectedDate, setSelectedDate] = useState(todayAsDateStringServer());

  const {
    data: customersData,
    error: customersError,
  } = useGetCustomersWithMetadataQuery();

  const {
    data: financialSummariesByDateData,
    error: financialSummariesByDateError,
  } = useGetFinancialSummariesByDateQuery({
    variables: {
      date: selectedDate,
    },
  });

  const {
    data: financialSummariesByCompanyIdData,
    error: financialSummariesByCompanyIdError,
  } = useGetFinancialSummariesByCompanyIdQuery({
    skip: !companyId,
    variables: {
      companyId: companyId,
    },
  });

  if (customersError) {
    alert("Error querying customers. " + customersError);
  }

  if (financialSummariesByDateError) {
    alert(
      "Error querying financial summaries by date. " +
        financialSummariesByDateError
    );
  }

  if (financialSummariesByCompanyIdError) {
    alert(
      "Error querying financial summaries by companyId. " +
        financialSummariesByCompanyIdError
    );
  }

  const customers = customersData?.customers || [];

  const financialSummariesByDate =
    financialSummariesByDateData?.financial_summaries || [];

  const financialSummariesByCompanyId =
    financialSummariesByCompanyIdData?.financial_summaries || [];

  return (
    <Page appBarTitle={"Reports"}>
      <Box className={classes.section}>
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
            financialSummaries={financialSummariesByDate}
            isExcelExport
          />
        </Box>
      </Box>
      <Box className={classes.sectionSpace} />
      <Box className={classes.section}>
        <Box mb={2}>
          <FormControl className={classes.inputField}>
            <InputLabel id="vendor-select-label">Customer</InputLabel>
            <Select
              disabled={customers.length <= 0}
              labelId="customer-select-label"
              id="customer-select"
              value={companyId}
              onChange={({ target: { value } }) =>
                setCompanyId(value as string)
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
          <FinancialSummariesDataGrid
            financialSummaries={financialSummariesByCompanyId}
            isExcelExport
          />
        </Box>
      </Box>
    </Page>
  );
}

export default BankReportsPage;

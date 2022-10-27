import {
  Box,
  Checkbox,
  FormControlLabel,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import FinancialSummariesDataGrid from "components/CustomerFinancialSummaries/FinancialSummariesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  useGetActiveFinancialSummariesByDateQuery,
  useGetFinancialSummariesByDateQuery,
} from "generated/graphql";
import { todayAsDateStringServer } from "lib/date";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [isActiveSelected, setIsActiveSelected] = useState(true);

  const classes = useStyles();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(todayAsDateStringServer());

  const {
    data: financialSummariesByDateData,
    error: financialSummariesByDateError,
  } = useGetFinancialSummariesByDateQuery({
    skip: !!isActiveSelected,
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

  const {
    data: activeFinancialSummariesByDateData,
    error: activeFinancialSummariesByDateError,
  } = useGetActiveFinancialSummariesByDateQuery({
    skip: !isActiveSelected,
    fetchPolicy: "network-only",
    variables: {
      date: selectedDate,
    },
  });

  if (activeFinancialSummariesByDateError) {
    alert(
      "Error querying financial summaries by date. " +
        activeFinancialSummariesByDateError
    );
  }

  const financialSummariesByDate = !!isActiveSelected
    ? activeFinancialSummariesByDateData?.financial_summaries || []
    : financialSummariesByDateData?.financial_summaries || [];

  return (
    <Box className={classes.container}>
      <Box className={classes.section} mt={4}>
        <Box mb={2}>
          <Box display="flex">
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
            <Box pt={1.5} ml={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={isActiveSelected}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setIsActiveSelected(event.target.checked)
                    }
                    color="primary"
                  />
                }
                label={"Is customer active?"}
              />
            </Box>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <FinancialSummariesDataGrid
            isCustomerNameFixed
            isFilteringEnabled
            isProductTypeVisible
            isSortingDisabled={false}
            financialSummaries={financialSummariesByDate}
            handleClickCustomer={(customerId) =>
              navigate(
                getBankCompanyRoute(customerId, BankCompanyRouteEnum.Overview)
              )
            }
          />
        </Box>
      </Box>
    </Box>
  );
}

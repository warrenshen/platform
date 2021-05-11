import {
  Box,
  Button,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from "@material-ui/core";
import FinancialSummariesDataGrid from "components/CustomerFinancialSummaries/FinancialSummariesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  Companies,
  useGetCustomersWithMetadataQuery,
  useGetFinancialSummariesByCompanyIdQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import { getTransfersMutation } from "lib/api/metrc";
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
      width: 200,
    },
  })
);

export default function BankTransfersTab() {
  const classes = useStyles();
  const history = useHistory();

  const [companyId, setCompanyId] = useState<Companies["id"]>("");
  const [licenseId, setLicenseId] = useState<string>("");
  const [startDate, setStartDate] = useState(todayAsDateStringServer());
  const [endDate, setEndDate] = useState(todayAsDateStringServer());

  const [getTransfers, { loading: isGetTransfersLoading }] = useCustomMutation(
    getTransfersMutation
  );

  const handleSubmit = async () => {
    const response = await getTransfers({
      variables: {
        license_id: licenseId,
        start_date: startDate,
        end_date: endDate,
      },
    });
    console.log({ response });
  };

  const isSubmitDisabled = isGetTransfersLoading;

  const {
    data: customersData,
    error: customersError,
  } = useGetCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
  });

  const {
    data: financialSummariesByCompanyIdData,
    error: financialSummariesByCompanyIdError,
  } = useGetFinancialSummariesByCompanyIdQuery({
    fetchPolicy: "network-only",
    skip: !companyId,
    variables: {
      companyId: companyId,
    },
  });

  if (customersError) {
    console.error({ error: customersError });
    alert(`Error in query (details in console): ${customersError.message}`);
  }

  if (financialSummariesByCompanyIdError) {
    console.error({ error: financialSummariesByCompanyIdError });
    alert(
      `Error in query (details in console): ${financialSummariesByCompanyIdError.message}`
    );
  }

  const customers = customersData?.customers || [];

  const financialSummariesByCompanyId =
    financialSummariesByCompanyIdData?.financial_summaries || [];

  return (
    <Box className={classes.container}>
      <Box className={classes.section} mt={4}>
        <Box display="flex" flexDirection="column">
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
          <Box mb={2}>
            <TextField
              className={classes.inputField}
              label="License ID"
              required
              value={licenseId}
              onChange={({ target: { value } }) => {
                setLicenseId(value);
              }}
            />
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
              onChange={(value) =>
                setEndDate(value || todayAsDateStringServer())
              }
            />
          </Box>
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
        <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
          <FinancialSummariesDataGrid
            isExcelExport
            financialSummaries={financialSummariesByCompanyId}
            onClickCustomerName={(customerId) =>
              history.push(`/customers/${customerId}/overview`)
            }
          />
        </Box>
      </Box>
    </Box>
  );
}

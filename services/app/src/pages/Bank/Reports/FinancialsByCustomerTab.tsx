import {
  Box,
  FormControl,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import FinancialSummariesDataGrid from "components/CustomerFinancialSummaries/FinancialSummariesDataGrid";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { NotificationBubble } from "components/Shared/NotificationBubble/NotificationBubble";
import {
  Companies,
  useGetCustomersForDropdownQuery,
  useGetFinancialSummariesByCompanyIdQuery,
} from "generated/graphql";
import { QuestionMarkIcon } from "icons";
import { Action } from "lib/auth/rbac-rules";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const StyledTooltip = styled((props) => (
  <Tooltip classes={{ popper: props.className }} {...props} />
))`
  & .MuiTooltip-tooltip {
    background-color: #fff;
    max-width: 732px;
    color: #000;
    box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.1);
  }
  & .MuiTooltip-arrow {
    color: #fff;
  }
`;

export default function BankReportsFinancialsByCustomerTab() {
  const history = useHistory();

  const [companyId, setCompanyId] = useState<Companies["id"]>("");
  const [companyName, setCompanyName] = useState<Companies["name"]>("");

  const { data: customersData, error: customersError } =
    useGetCustomersForDropdownQuery({
      fetchPolicy: "network-only",
    });

  const {
    data: financialSummariesByCompanyIdData,
    error: financialSummariesByCompanyIdError,
    refetch: financialSummariesByCompanyIdRefetch,
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

  const needsRecompute = financialSummariesByCompanyId.filter(
    (financialSummary) => financialSummary.needs_recompute === true
  );

  const runBalanceStartDate = needsRecompute[needsRecompute.length - 1]?.date;
  const runBalanceEndDate = needsRecompute[0]?.date;

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        <Box display="flex" flexDirection="column" width={400} mb={2}>
          <FormControl>
            <Autocomplete
              autoHighlight
              blurOnSelect
              disabled={customers.length <= 0}
              options={customers}
              getOptionLabel={(customer) => customer.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select customer"
                  variant="outlined"
                />
              )}
              onChange={(_event, customer) => {
                setCompanyId(customer?.id || null);
                // @ts-ignore
                setCompanyName(customer?.name || null);
              }}
            />
          </FormControl>
        </Box>
        {!!companyId && (
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="row-reverse" mb={2}>
              <Can perform={Action.RunBalances}>
                <Box>
                  <Box
                    display="flex"
                    flexDirection="column"
                    position="relative"
                    alignItems="end"
                  >
                    {needsRecompute.length > 0 && (
                      <NotificationBubble>
                        {needsRecompute.length}
                      </NotificationBubble>
                    )}
                    <ModalButton
                      isDisabled={!companyId}
                      label={"Run Balances"}
                      color={"primary"}
                      modal={({ handleClose }) => (
                        <RunCustomerBalancesModal
                          companyId={companyId}
                          companyName={companyName}
                          recommendedStartDate={runBalanceStartDate}
                          recommendedEndDate={runBalanceEndDate}
                          handleClose={() => {
                            financialSummariesByCompanyIdRefetch();
                            handleClose();
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Can>
            </Box>
            <Box display="flex" mb={2}>
              <Typography variant="body1">Financials - For Customer</Typography>
              <StyledTooltip
                arrow
                placement="right-start"
                title={
                  <Box m={2}>
                    <Box display="flex" flexDirection="column">
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Principal balance (PB):
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          gutterBottom
                        >
                          Total outstanding principal with payments applied on
                          deposit date as of end of date
                        </Typography>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="body2" gutterBottom>
                          PB including clearance days:
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          gutterBottom
                        >
                          Total outstanding principal with payments applied on
                          settlement date as of end of date
                        </Typography>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="body2" gutterBottom>
                          Amount to pay interest on:
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          gutterBottom
                        >
                          Total outstanding principal as of start of date (no
                          payments applied yet)
                        </Typography>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="body2" gutterBottom>
                          Interest accrued today:
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          gutterBottom
                        >
                          = Amount to pay interest on * interest rate
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                }
              >
                <IconButton style={{ padding: 0, marginLeft: "16px" }}>
                  <QuestionMarkIcon />
                </IconButton>
              </StyledTooltip>
            </Box>
            <Box display="flex" flexDirection="column">
              {financialSummariesByCompanyId.length > 0 ? (
                <FinancialSummariesDataGrid
                  isProductTypeVisible
                  financialSummaries={financialSummariesByCompanyId}
                  handleClickCustomer={(customerId) =>
                    history.push(
                      getBankCompanyRoute(
                        customerId,
                        BankCompanyRouteEnum.Overview
                      )
                    )
                  }
                />
              ) : (
                <Typography variant="body2">No financial summaries</Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

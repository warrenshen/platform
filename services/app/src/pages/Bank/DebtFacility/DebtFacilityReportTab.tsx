import { Box, FormControl, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import DebtFacilityReportDataGrid from "components/DebtFacility/DebtFacilityReportDataGrid";
import {
  DebtFacilities,
  GetDebtFacilitiesSubscription,
  useGetOpenLoansByDebtFacilityIdSubscription,
} from "generated/graphql";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { useState } from "react";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

type Facilities = GetDebtFacilitiesSubscription["debt_facilities"];

interface Props {
  facilities: Facilities;
}

export default function DebtFacilityReportTab({ facilities }: Props) {
  const history = useHistory();
  const [selectedDebtFacilityId, setSelectedDebtFacilityId] = useState<
    DebtFacilities["id"]
  >("");

  const { data, error } = useGetOpenLoansByDebtFacilityIdSubscription({
    skip: selectedDebtFacilityId === "",
    variables: {
      statuses: [
        "sold_into_debt_facility",
        "bespoke_balance_sheet",
        "repurchased",
        "update_required",
        "waiver",
      ],
      target_facility_id: selectedDebtFacilityId,
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }
  const loans = data?.loans || [];

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column" width={400} mb={2}>
          <FormControl>
            <Autocomplete
              autoHighlight
              id="auto-complete-debt-facility"
              options={facilities}
              getOptionLabel={(debtFacility) => {
                return `${debtFacility.name}`;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={"Pick debt facility"}
                  variant="outlined"
                />
              )}
              onChange={(_event, debtFacility) => {
                setSelectedDebtFacilityId(debtFacility?.id || "");
              }}
            />
          </FormControl>
        </Box>
        {!!selectedDebtFacilityId && (
          <Box display="flex" flexDirection="column">
            <DebtFacilityReportDataGrid
              loans={loans}
              isCompanyVisible
              isStatusVisible
              isMaturityVisible
              isReportingVisible
              isDisbursementIdentifierVisible
              isDaysPastDueVisible
              handleClickCustomer={(customerId) =>
                history.push(
                  getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
                )
              }
            />
          </Box>
        )}
      </Box>
    </Container>
  );
}

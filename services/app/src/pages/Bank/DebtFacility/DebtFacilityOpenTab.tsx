import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import {
  DebtFacilities,
  GetDebtFacilitiesSubscription,
  useGetOpenLoansByDebtFacilityIdSubscription,
  useGetOpenLoansByDebtFacilityStatusesSubscription,
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

export default function DebtFacilityOpenTab({ facilities }: Props) {
  const history = useHistory();
  const [selectedDebtFacilityId, setSelectedDebtFacilityId] = useState<
    DebtFacilities["id"]
  >("");

  const {
    data: debtFacilityData,
    error: debtFacilityError,
  } = useGetOpenLoansByDebtFacilityIdSubscription({
    skip: selectedDebtFacilityId === "",
    variables: {
      statuses: ["sold_into_debt_facility"],
      target_facility_id: selectedDebtFacilityId,
    },
  });
  if (debtFacilityError) {
    console.error({ debtFacilityError });
    alert(`Error in query (details in console): ${debtFacilityError.message}`);
  }
  const debtFacilityLoans = debtFacilityData?.loans || [];

  // Get loans currently on bespoke's books (or repurchased)
  const {
    data: bespokeData,
    error: bespokeError,
  } = useGetOpenLoansByDebtFacilityStatusesSubscription({
    variables: {
      statuses: ["bespoke_balance_sheet", "repurchased"],
    },
  });
  if (bespokeError) {
    console.error({ bespokeError });
    alert(`Error in query (details in console): ${bespokeError.message}`);
  }
  const bespokeLoans = bespokeData?.loans || [];

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
            <Typography variant="h6">Debt Facility Balance Sheet</Typography>
            <DebtFacilityLoansDataGrid
              loans={debtFacilityLoans}
              isCompanyVisible={true}
              isStatusVisible={true}
              isMaturityVisible={true}
              isDisbursementIdentifierVisible={true}
              handleClickCustomer={(customerId) =>
                history.push(
                  getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
                )
              }
            />
          </Box>
        )}
        <Box display="flex" flexDirection="column">
          <Typography variant="h6">Bespoke Balance Sheet</Typography>
          <DebtFacilityLoansDataGrid
            loans={bespokeLoans}
            isCompanyVisible={true}
            isStatusVisible={true}
            isMaturityVisible={true}
            isDisbursementIdentifierVisible={true}
            handleClickCustomer={(customerId) =>
              history.push(
                getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
              )
            }
          />
        </Box>
      </Box>
    </Container>
  );
}

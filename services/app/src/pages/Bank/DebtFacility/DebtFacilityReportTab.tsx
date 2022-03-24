import { Box } from "@material-ui/core";
import DebtFacilityReportDataGrid from "components/DebtFacility/DebtFacilityReportDataGrid";
import {
  DebtFacilities,
  GetDebtFacilitiesSubscription,
  useGetReportLoansByDebtFacilityIdSubscription,
} from "generated/graphql";
import { DebtFacilityStatusEnum } from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

type Facilities = GetDebtFacilitiesSubscription["debt_facilities"];

interface Props {
  facilities: Facilities;
  selectedDebtFacilityId: DebtFacilities["id"];
  allFacilityIds: DebtFacilities["id"][];
}

export default function DebtFacilityReportTab({
  facilities,
  selectedDebtFacilityId,
  allFacilityIds,
}: Props) {
  const history = useHistory();

  const { data, error } = useGetReportLoansByDebtFacilityIdSubscription({
    variables: {
      debt_facility_statuses: [
        DebtFacilityStatusEnum.SOLD_INTO_DEBT_FACILITY,
        DebtFacilityStatusEnum.UPDATE_REQUIRED,
        DebtFacilityStatusEnum.WAIVER,
      ],
      other_statuses: [
        DebtFacilityStatusEnum.BESPOKE_BALANCE_SHEET,
        DebtFacilityStatusEnum.REPURCHASED,
      ],
      target_facility_ids: !!selectedDebtFacilityId
        ? [selectedDebtFacilityId]
        : allFacilityIds,
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
        {
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
        }
      </Box>
    </Container>
  );
}

import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import DebtFacilityReportDataGrid from "components/DebtFacility/DebtFacilityReportDataGrid";
import {
  DebtFacilities,
  GetDebtFacilitiesSubscription,
  useGetReportLoansByDebtFacilityIdSubscription,
} from "generated/graphql";
import DateInput from "components/Shared/FormInputs/DateInput";
import { DebtFacilityStatusEnum, ProductTypeEnum } from "lib/enum";
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

type Facilities = GetDebtFacilitiesSubscription["debt_facilities"];

interface Props {
  facilities: Facilities;
  selectedDebtFacilityId: DebtFacilities["id"];
  supportedProductTypes: ProductTypeEnum[];
}

export default function DebtFacilityReportTab({
  facilities,
  selectedDebtFacilityId,
  supportedProductTypes,
}: Props) {
  const history = useHistory();
  const classes = useStyles();

  const [lastDebtFacilityReportDate, setLastDebtFacilityReportDate] = useState(
    ""
  );

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
        : [],
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
        {!!selectedDebtFacilityId && (
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="column" mb={4}>
              <DateInput
                disableNonBankDays
                className={classes.inputField}
                id="debt-facility-report-tab-date-picker"
                label="Last Report Date"
                value={lastDebtFacilityReportDate}
                onChange={(value) => setLastDebtFacilityReportDate(value || "")}
              />
            </Box>
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
              supportedProductTypes={supportedProductTypes}
              lastDebtFacilityReportDate={lastDebtFacilityReportDate}
            />
          </Box>
        )}
        {!selectedDebtFacilityId && (
          <Alert severity="info">
            Please select a debt facility from the above dropdown to bring up a
            report.
          </Alert>
        )}
      </Box>
    </Container>
  );
}

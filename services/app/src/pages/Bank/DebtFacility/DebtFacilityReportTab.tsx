import {
  Box,
  Checkbox,
  FormControlLabel,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import DebtFacilityReportDataGrid from "components/DebtFacility/DebtFacilityReportDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  DebtFacilities,
  GetDebtFacilitiesQuery,
  useGetReportLoansByDebtFacilityIdSubscription,
} from "generated/graphql";
import { parseDateStringServer, todayAsDateStringServer } from "lib/date";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityStatusEnum,
  ProductTypeEnum,
} from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

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

type Facilities = GetDebtFacilitiesQuery["debt_facilities"];

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
  const navigate = useNavigate();
  const classes = useStyles();

  const [lastDebtFacilityReportDate, setLastDebtFacilityReportDate] =
    useState("");
  const [currentDebtFacilityReportDate, setCurrentDebtFacilityReportDate] =
    useState(todayAsDateStringServer());
  const [isAnonymized, setIsAnonymized] = useState(false);

  const { data, error } = useGetReportLoansByDebtFacilityIdSubscription({
    skip: currentDebtFacilityReportDate === "",
    variables: {
      debt_facility_statuses: [
        DebtFacilityStatusEnum.SoldIntoDebtFacility,
        DebtFacilityStatusEnum.UpdateRequired,
        DebtFacilityStatusEnum.Waiver,
        DebtFacilityCompanyStatusEnum.Waiver,
      ],
      other_statuses: [
        DebtFacilityStatusEnum.BespokeBalanceSheet,
        DebtFacilityStatusEnum.Repurchased,
      ],
      target_facility_ids: !!selectedDebtFacilityId
        ? [selectedDebtFacilityId]
        : [],
      target_date: currentDebtFacilityReportDate,
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const companies = data?.companies || [];
  const loans = companies.flatMap((company) => {
    return company.loans;
  });
  const loansInfoLookup = Object.assign(
    {},
    ...companies.map((company) => {
      return {
        [company.id]: company?.financial_summaries?.[0]?.loans_info
          ? company.financial_summaries[0].loans_info
          : {},
      };
    })
  );

  const lastReportDate = parseDateStringServer(lastDebtFacilityReportDate);
  const currentReportDate = parseDateStringServer(
    currentDebtFacilityReportDate
  );
  const isDateWarningShown = currentReportDate < lastReportDate;

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        {!!selectedDebtFacilityId && (
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="row" mb={4}>
              <DateInput
                disableFuture
                className={classes.inputField}
                id="debt-facility-report-tab-previous-report-date-picker"
                label="Last Report Date"
                value={lastDebtFacilityReportDate}
                onChange={(value) => setLastDebtFacilityReportDate(value || "")}
              />
              <Box ml={3}>
                <DateInput
                  disableFuture
                  className={classes.inputField}
                  id="debt-facility-report-tab-current-reportdate-picker"
                  label="Current Report Date"
                  value={currentDebtFacilityReportDate}
                  onChange={(value) =>
                    setCurrentDebtFacilityReportDate(value || "")
                  }
                />
              </Box>
              <Box pt={1.5} ml={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isAnonymized}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setIsAnonymized(event.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label={"Anonymize Report?"}
                />
              </Box>
            </Box>
            {!!isDateWarningShown && (
              <Alert severity="info">
                Please select a date for the last debt facility that is earlier
                than or equal to the current report date.
              </Alert>
            )}
            {!isDateWarningShown && (
              <DebtFacilityReportDataGrid
                loans={loans}
                loansInfoLookup={loansInfoLookup}
                isAnonymized={isAnonymized}
                handleClickCustomer={(customerId) =>
                  navigate(
                    getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
                  )
                }
                supportedProductTypes={supportedProductTypes}
                lastDebtFacilityReportDate={lastDebtFacilityReportDate}
                currentDebtFacilityReportDate={currentDebtFacilityReportDate}
              />
            )}
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

import { Box, TextField } from "@material-ui/core";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import { useGetOpenLoansByDebtFacilityStatusesQuery } from "generated/graphql";
import { useFilterDebtFacilityLoansBySearchQuery } from "hooks/useFilterDebtFacilityLoans";
import { todayAsDateStringServer } from "lib/date";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityStatusEnum,
} from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function DebtFacilityAllTab() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error } = useGetOpenLoansByDebtFacilityStatusesQuery({
    variables: {
      statuses: [
        DebtFacilityStatusEnum.SoldIntoDebtFacility,
        DebtFacilityStatusEnum.BespokeBalanceSheet,
        DebtFacilityStatusEnum.Repurchased,
        DebtFacilityStatusEnum.UpdateRequired,
        DebtFacilityStatusEnum.Waiver,
        DebtFacilityCompanyStatusEnum.Waiver,
      ],
      target_date: todayAsDateStringServer(),
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }
  const loans = useFilterDebtFacilityLoansBySearchQuery(searchQuery, data);
  const companies = data?.companies || [];
  const companyInfoLookup = Object.assign(
    {},
    ...companies.map((company) => {
      return {
        [company.id]: (({ loans, ...c }) => c)(company),
      };
    })
  );

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-end"
          mb={2}
        >
          <Box display="flex">
            <TextField
              autoFocus
              label="Search by customer name"
              value={searchQuery}
              onChange={({ target: { value } }) => setSearchQuery(value)}
              style={{ width: 400 }}
            />
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <DebtFacilityLoansDataGrid
            loans={loans}
            companyInfoLookup={companyInfoLookup}
            handleClickCustomer={(customerId) =>
              navigate(
                getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
              )
            }
          />
        </Box>
      </Box>
    </Container>
  );
}

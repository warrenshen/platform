import AdvancesDataGrid from "components/Advances/AdvancesDataGrid";
import {
  CustomerForBankFragment,
  useGetAdvancesSubscription,
} from "generated/graphql";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankAdvancesAllTab() {
  const navigate = useNavigate();

  const { data } = useGetAdvancesSubscription();
  const payments = data?.payments || [];

  const handleClickCustomer = useMemo(
    () => (customerId: CustomerForBankFragment["id"]) =>
      navigate(getBankCompanyRoute(customerId, BankCompanyRouteEnum.Overview)),
    [navigate]
  );

  return (
    <Container>
      <AdvancesDataGrid
        payments={payments}
        handleClickCustomer={handleClickCustomer}
      />
    </Container>
  );
}

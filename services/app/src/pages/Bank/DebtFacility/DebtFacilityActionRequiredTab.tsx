import { Box, TextField } from "@material-ui/core";
import CheckForDebtFacilityPastDueLoansModal from "components/DebtFacility/CheckForDebtFacilityPastDueLoansModal";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import ResolveDebtFacilityLoanModal from "components/DebtFacility/ResolveDebtFacilityLoanModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { OpenLoanForDebtFacilityFragment } from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

interface Props {
  loans: OpenLoanForDebtFacilityFragment[];
  searchQuery: string;
  setSearchQuery: (newQuery: string) => void;
}

export default function DebtFacilityActionRequiredTab({
  loans,
  searchQuery,
  setSearchQuery,
}: Props) {
  const history = useHistory();

  const [selectedLoans, setSelectedLoans] = useState<
    OpenLoanForDebtFacilityFragment[]
  >([]);
  const handleSelectLoans = useMemo(
    () => (loans: OpenLoanForDebtFacilityFragment[]) => {
      setSelectedLoans(loans);
    },
    [setSelectedLoans]
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
          <Box my={2} display="flex" flexDirection="row-reverse">
            <Can perform={Action.CheckDebtFacilityForPastDue}>
              <Box mr={2}>
                <ModalButton
                  label={"Check Past Due"}
                  modal={({ handleClose }) => {
                    return (
                      <CheckForDebtFacilityPastDueLoansModal
                        handleClose={() => {
                          handleClose();
                        }}
                      />
                    );
                  }}
                />
              </Box>
            </Can>
            <Can perform={Action.ResolveDebtFacilityLoan}>
              <Box mr={2}>
                <ModalButton
                  isDisabled={selectedLoans.length !== 1}
                  label={"Resolve Loan"}
                  modal={({ handleClose }) => {
                    const handler = () => {
                      handleClose();
                      setSelectedLoans([]);
                    };
                    return (
                      <ResolveDebtFacilityLoanModal
                        selectedLoan={selectedLoans[0]}
                        handleClose={handler}
                      />
                    );
                  }}
                />
              </Box>
            </Can>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <DebtFacilityLoansDataGrid
            isMultiSelectEnabled
            loans={loans}
            handleClickCustomer={(customerId) =>
              history.push(
                getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
              )
            }
            handleSelectLoans={handleSelectLoans}
          />
        </Box>
      </Box>
    </Container>
  );
}

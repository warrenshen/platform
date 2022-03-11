import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { Action } from "lib/auth/rbac-rules";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import {
  DebtFacilities,
  GetDebtFacilitiesSubscription,
  LoanFragment,
  useGetOpenLoansByDebtFacilityIdSubscription,
  useGetOpenLoansByDebtFacilityStatusesSubscription,
} from "generated/graphql";
import MoveDebtFacilityLoanModal from "components/DebtFacility/MoveDebtFacilityLoanModal";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { DebtFacilityStatusEnum } from "lib/enum";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useFilterDebtFacilityLoansBySearchQuery } from "hooks/useFilterDebtFacilityLoans";

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
  const [debtFacilitySearchQuery, setDebtFacilitySearchQuery] = useState("");
  const [bespokeSearchQuery, setBespokeSearchQuery] = useState("");

  // Handle selection for loans in debt facility datagrid
  const [selectedFacilityLoans, setSelectedFacilityLoans] = useState<
    LoanFragment[]
  >([]);
  const handleSelectFacilityLoans = useMemo(
    () => (loans: LoanFragment[]) => {
      setSelectedFacilityLoans(loans);
    },
    [setSelectedFacilityLoans]
  );

  // Handle selection for loans in bespoke datagrid
  const [selectedBespokeLoans, setSelectedBespokeLoans] = useState<
    LoanFragment[]
  >([]);
  const handleSelectBespokeLoans = useMemo(
    () => (loans: LoanFragment[]) => {
      setSelectedBespokeLoans(loans);
    },
    [setSelectedBespokeLoans]
  );

  const {
    data: debtFacilityData,
    error: debtFacilityError,
  } = useGetOpenLoansByDebtFacilityIdSubscription({
    skip: selectedDebtFacilityId === "",
    variables: {
      statuses: [DebtFacilityStatusEnum.SOLD_INTO_DEBT_FACILITY],
      target_facility_id: selectedDebtFacilityId,
    },
  });
  if (debtFacilityError) {
    console.error({ debtFacilityError });
    alert(`Error in query (details in console): ${debtFacilityError.message}`);
  }
  const debtFacilityLoans = useFilterDebtFacilityLoansBySearchQuery(
    debtFacilitySearchQuery,
    debtFacilityData
  );

  // Get loans currently on bespoke's books (or repurchased)
  const {
    data: bespokeData,
    error: bespokeError,
  } = useGetOpenLoansByDebtFacilityStatusesSubscription({
    variables: {
      statuses: [
        DebtFacilityStatusEnum.BESPOKE_BALANCE_SHEET,
        DebtFacilityStatusEnum.REPURCHASED,
      ],
    },
  });
  if (bespokeError) {
    console.error({ bespokeError });
    alert(`Error in query (details in console): ${bespokeError.message}`);
  }
  const bespokeLoans = useFilterDebtFacilityLoansBySearchQuery(
    bespokeSearchQuery,
    bespokeData
  );

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
                  value={debtFacilitySearchQuery}
                  onChange={({ target: { value } }) =>
                    setDebtFacilitySearchQuery(value)
                  }
                  style={{ width: 400 }}
                />
              </Box>
              <Box my={2} display="flex" flexDirection="row-reverse">
                <Can perform={Action.MoveDebtFacilityLoan}>
                  <Box mr={2}>
                    <ModalButton
                      isDisabled={selectedFacilityLoans.length === 0}
                      label={"Move to Bespoke Balance Sheet"}
                      modal={({ handleClose }) => {
                        const handler = () => {
                          handleClose();
                          setSelectedFacilityLoans([]);
                        };
                        return (
                          <MoveDebtFacilityLoanModal
                            isMovingToFacility={false}
                            selectedLoans={selectedFacilityLoans}
                            facilities={facilities}
                            handleClose={handler}
                          />
                        );
                      }}
                    />
                  </Box>
                </Can>
              </Box>
            </Box>
            <DebtFacilityLoansDataGrid
              isMultiSelectEnabled
              loans={debtFacilityLoans}
              isCompanyVisible
              isStatusVisible
              isMaturityVisible
              isDisbursementIdentifierVisible
              handleClickCustomer={(customerId) =>
                history.push(
                  getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
                )
              }
              handleSelectLoans={handleSelectFacilityLoans}
            />
          </Box>
        )}
        <Box display="flex" flexDirection="column">
          <Typography variant="h6">Bespoke Balance Sheet</Typography>
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
                value={bespokeSearchQuery}
                onChange={({ target: { value } }) =>
                  setBespokeSearchQuery(value)
                }
                style={{ width: 400 }}
              />
            </Box>
            <Box my={2} display="flex" flexDirection="row-reverse">
              <Can perform={Action.MoveDebtFacilityLoan}>
                <Box mr={2}>
                  <ModalButton
                    isDisabled={selectedBespokeLoans.length === 0}
                    label={"Move to Debt Facility"}
                    modal={({ handleClose }) => {
                      return (
                        <MoveDebtFacilityLoanModal
                          isMovingToFacility
                          selectedLoans={selectedBespokeLoans}
                          facilities={facilities}
                          handleClose={() => {
                            handleClose();
                            setSelectedBespokeLoans([]);
                          }}
                        />
                      );
                    }}
                  />
                </Box>
              </Can>
            </Box>
          </Box>
          <DebtFacilityLoansDataGrid
            isMultiSelectEnabled
            loans={bespokeLoans}
            isCompanyVisible
            isStatusVisible
            isMaturityVisible
            isDisbursementIdentifierVisible
            handleClickCustomer={(customerId) =>
              history.push(
                getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
              )
            }
            handleSelectLoans={handleSelectBespokeLoans}
          />
        </Box>
      </Box>
    </Container>
  );
}

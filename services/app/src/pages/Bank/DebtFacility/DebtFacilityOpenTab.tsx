import { Box, TextField, Typography } from "@material-ui/core";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import MoveDebtFacilityLoanModal from "components/DebtFacility/MoveDebtFacilityLoanModal";
import UpdateDebtFacilityLoanAssignedDateModal from "components/DebtFacility/UpdateDebtFacilityLoanAssignedDateModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  DebtFacilities,
  GetDebtFacilitiesSubscription,
  OpenLoanForDebtFacilityFragment,
  useGetOpenLoansByDebtFacilityIdSubscription,
  useGetOpenLoansByDebtFacilityStatusesSubscription,
} from "generated/graphql";
import { useFilterDebtFacilityLoansBySearchQuery } from "hooks/useFilterDebtFacilityLoans";
import { Action } from "lib/auth/rbac-rules";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityStatusEnum,
  ProductTypeEnum,
} from "lib/enum";
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

type Facilities = GetDebtFacilitiesSubscription["debt_facilities"];

interface Props {
  facilities: Facilities;
  selectedDebtFacilityId: DebtFacilities["id"];
  allFacilityIds: DebtFacilities["id"][];
  supportedProductTypes: ProductTypeEnum[];
  defaultDebtFacilityId: string;
}

export default function DebtFacilityOpenTab({
  facilities,
  selectedDebtFacilityId,
  allFacilityIds,
  supportedProductTypes,
  defaultDebtFacilityId,
}: Props) {
  const history = useHistory();
  const [debtFacilitySearchQuery, setDebtFacilitySearchQuery] = useState("");
  const [bespokeSearchQuery, setBespokeSearchQuery] = useState("");

  // Handle selection for loans in debt facility datagrid
  const [selectedFacilityLoans, setSelectedFacilityLoans] = useState<
    OpenLoanForDebtFacilityFragment[]
  >([]);
  const handleSelectFacilityLoans = useMemo(
    () => (loans: OpenLoanForDebtFacilityFragment[]) => {
      setSelectedFacilityLoans(loans);
    },
    [setSelectedFacilityLoans]
  );

  // Handle selection for loans in bespoke datagrid
  const [selectedBespokeLoans, setSelectedBespokeLoans] = useState<
    OpenLoanForDebtFacilityFragment[]
  >([]);
  const handleSelectBespokeLoans = useMemo(
    () => (loans: OpenLoanForDebtFacilityFragment[]) => {
      setSelectedBespokeLoans(loans);
    },
    [setSelectedBespokeLoans]
  );

  const { data: debtFacilityData, error: debtFacilityError } =
    useGetOpenLoansByDebtFacilityIdSubscription({
      variables: {
        statuses: [
          DebtFacilityStatusEnum.SoldIntoDebtFacility,
          DebtFacilityStatusEnum.Waiver,
          DebtFacilityCompanyStatusEnum.Waiver,
        ],
        target_facility_ids: !!selectedDebtFacilityId
          ? [selectedDebtFacilityId]
          : allFacilityIds,
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
  const { data: bespokeData, error: bespokeError } =
    useGetOpenLoansByDebtFacilityStatusesSubscription({
      variables: {
        statuses: [
          DebtFacilityStatusEnum.BespokeBalanceSheet,
          DebtFacilityStatusEnum.Repurchased,
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
        {
          <Box display="flex" flexDirection="column">
            <Typography variant="h6">Debt Facility</Typography>
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
                            supportedProductTypes={supportedProductTypes}
                            defaultDebtFacilityId={defaultDebtFacilityId}
                          />
                        );
                      }}
                    />
                  </Box>
                </Can>
                <Can perform={Action.UpdateDebtFacilityAssignedDate}>
                  <Box mr={2}>
                    <ModalButton
                      isDisabled={selectedFacilityLoans.length === 0}
                      label={"Update Assigned Date"}
                      modal={({ handleClose }) => {
                        return (
                          <UpdateDebtFacilityLoanAssignedDateModal
                            selectedLoans={selectedFacilityLoans}
                            handleClose={() => {
                              handleClose();
                              setSelectedFacilityLoans([]);
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
              loans={debtFacilityLoans}
              isCompanyVisible
              isStatusVisible
              isMaturityVisible
              isDebtFacilityVisible
              isDisbursementIdentifierVisible
              handleClickCustomer={(customerId) =>
                history.push(
                  getBankCompanyRoute(customerId, BankCompanyRouteEnum.Loans)
                )
              }
              handleSelectLoans={handleSelectFacilityLoans}
            />
          </Box>
        }
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
                          supportedProductTypes={supportedProductTypes}
                          defaultDebtFacilityId={defaultDebtFacilityId}
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
            isEligibilityVisible
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

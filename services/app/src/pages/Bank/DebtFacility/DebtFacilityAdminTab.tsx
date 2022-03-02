import { Box, Typography } from "@material-ui/core";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { Action } from "lib/auth/rbac-rules";
import DebtFacilityCapacityDataGrid from "components/DebtFacility/DebtFacilityCapacityDataGrid";
import DebtFacilityDataGrid from "components/DebtFacility/DebtFacilityDataGrid";
import UpdateDebtFacilityCapacityModal from "components/DebtFacility/UpdateDebtFacilityCapacityModal";
import CreateUpdateDebtFacilityModal from "components/DebtFacility/CreateUpdateDebtFacilityModal";
import {
  GetDebtFacilitiesSubscription,
  useGetDebtFacilityCapacitySubscription,
} from "generated/graphql";
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
}

export default function DebtFacilityAdminTab({ facilities }: Props) {
  const {
    data: capacityData,
    error: capacityError,
  } = useGetDebtFacilityCapacitySubscription();
  if (capacityError) {
    console.error({ capacityError });
    alert(`Error in query (details in console): ${capacityError.message}`);
  }

  const capacities = capacityData?.debt_facility_capacities || [];
  const currentCapacity = capacities[0]?.amount || 0.0;

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Typography variant="h6">Admin: Capacities</Typography>
        <Box my={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.UpdateDebtFacilityCapacity}>
            <Box mr={2}>
              <ModalButton
                isDisabled={false}
                label={"Update Debt Facility Capacity"}
                modal={({ handleClose }) => {
                  const handler = () => {
                    handleClose();
                  };
                  return (
                    <UpdateDebtFacilityCapacityModal
                      currentCapacity={currentCapacity}
                      handleClose={handler}
                    />
                  );
                }}
              />
            </Box>
          </Can>
        </Box>
        <DebtFacilityCapacityDataGrid capacities={capacities} />
      </Box>
      <Box display="flex" flexDirection="column">
        <Typography variant="h6">Admin: Facilities</Typography>
        <Box my={2} display="flex" flexDirection="row-reverse">
          <Can perform={Action.AddDebtFacility}>
            <Box mr={2}>
              <ModalButton
                isDisabled={false}
                label={"Add Debt Facility"}
                modal={({ handleClose }) => {
                  const handler = () => {
                    handleClose();
                  };
                  return (
                    <CreateUpdateDebtFacilityModal
                      isUpdate={false}
                      handleClose={handler}
                    />
                  );
                }}
              />
            </Box>
          </Can>
          <Can perform={Action.UpdateDebtFacility}>
            <Box mr={2}>
              <ModalButton
                isDisabled={false}
                label={"Edit Debt Facility"}
                modal={({ handleClose }) => {
                  const handler = () => {
                    handleClose();
                  };
                  return (
                    <CreateUpdateDebtFacilityModal
                      isUpdate={true}
                      handleClose={handler}
                    />
                  );
                }}
              />
            </Box>
          </Can>
        </Box>
        <DebtFacilityDataGrid facilities={facilities} />
      </Box>
    </Container>
  );
}

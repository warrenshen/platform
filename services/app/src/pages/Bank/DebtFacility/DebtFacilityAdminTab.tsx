import { Box, Typography } from "@material-ui/core";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { Action } from "lib/auth/rbac-rules";
import DebtFacilityDataGrid from "components/DebtFacility/DebtFacilityDataGrid";
import CreateUpdateDebtFacilityModal from "components/DebtFacility/CreateUpdateDebtFacilityModal";
import {
  DebtFacilityFragment,
  GetDebtFacilitiesSubscription,
} from "generated/graphql";
import styled from "styled-components";
import { useMemo, useState } from "react";

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
  const [selectedDebtFacilityIds, setSelectedDebtFacilityIds] = useState<
    DebtFacilityFragment["id"]
  >([]);

  const selectedDebtFacility = useMemo(
    () =>
      selectedDebtFacilityIds.length === 1
        ? facilities.find(
            (facility) => facility.id === selectedDebtFacilityIds[0]
          )
        : null,
    [facilities, selectedDebtFacilityIds]
  );

  const handleSelectDebtFacilities = useMemo(
    () => (facilities: Facilities) => {
      setSelectedDebtFacilityIds(facilities.map((facility) => facility.id));
    },
    [setSelectedDebtFacilityIds]
  );

  return (
    <Container>
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
                      selectedDebtFacility={null}
                    />
                  );
                }}
              />
            </Box>
          </Can>
          <Can perform={Action.UpdateDebtFacility}>
            <Box mr={2}>
              <ModalButton
                isDisabled={selectedDebtFacilityIds.length !== 1}
                label={"Edit Debt Facility"}
                modal={({ handleClose }) => {
                  const handler = () => {
                    handleClose();
                  };
                  return (
                    <CreateUpdateDebtFacilityModal
                      isUpdate={true}
                      handleClose={handler}
                      selectedDebtFacility={
                        selectedDebtFacility as DebtFacilityFragment
                      }
                    />
                  );
                }}
              />
            </Box>
          </Can>
        </Box>
        <DebtFacilityDataGrid
          facilities={facilities}
          handleSelectDebtFacilities={handleSelectDebtFacilities}
          selectedDebtFacilityIds={selectedDebtFacilityIds}
        />
      </Box>
    </Container>
  );
}

import { Box, Checkbox, FormControlLabel, TextField } from "@material-ui/core";
import CustomersDataGrid from "components/Customer/CustomersDataGrid";
import UpdateCompanyDebtFacilityStatusModal from "components/DebtFacility/UpdateCompanyDebtFacilityStatusModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  CustomersWithMetadataFragment,
  useGetActiveCustomersWithMetadataQuery,
  useGetCustomersWithMetadataQuery,
} from "generated/graphql";
import { useFilterCustomersByFragment } from "hooks/useFilterCustomers";
import { Action } from "lib/auth/rbac-rules";
import { todayAsDateStringServer } from "lib/date";
import { ChangeEvent, useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function DebtFacilityCustomersTab() {
  const [isActiveSelected, setIsActiveSelected] = useState(true);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Companies["id"]>(
    []
  );

  const {
    data: allData,
    refetch: refetchAllData,
    error: allError,
  } = useGetCustomersWithMetadataQuery({
    skip: !!isActiveSelected,
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (allError) {
    console.error({ allError });
    alert(`Error in query (details in console): ${allError.message}`);
  }

  const {
    data: activeData,
    refetch: refetchActiveData,
    error: allActiveError,
  } = useGetActiveCustomersWithMetadataQuery({
    skip: !isActiveSelected,
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (allActiveError) {
    console.error({ allActiveError });
    alert(`Error in query (details in console): ${allActiveError.message}`);
  }

  const data = useMemo(
    () =>
      !!isActiveSelected
        ? activeData?.customers || []
        : allData?.customers || [],
    [isActiveSelected, activeData, allData]
  );

  const [searchQuery, setSearchQuery] = useState("");

  const customers = useFilterCustomersByFragment(
    searchQuery,
    data
  ) as CustomersWithMetadataFragment[];

  const selectedCompany = useMemo(
    () =>
      selectedCompanyIds.length === 1
        ? customers.find((company) => company.id === selectedCompanyIds[0])
        : null,
    [customers, selectedCompanyIds]
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
            <Box pt={1.5} ml={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={isActiveSelected}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setIsActiveSelected(event.target.checked)
                    }
                    color="primary"
                  />
                }
                label={"Is customer active?"}
              />
            </Box>
          </Box>
          <Can perform={Action.UpdateCompanyDebtFacilityStatus}>
            <Box mr={2}>
              <ModalButton
                isDisabled={!selectedCompany}
                dataCy={"edit-company-debt-facility-status-button"}
                label={"Edit Debt Facility Status"}
                color={"primary"}
                modal={({ handleClose }) =>
                  !!selectedCompany ? (
                    <UpdateCompanyDebtFacilityStatusModal
                      handleClose={() => {
                        isActiveSelected
                          ? refetchAllData()
                          : refetchActiveData();
                        handleClose();
                        setSelectedCompanyIds([]);
                      }}
                      selectedCompany={selectedCompany}
                    />
                  ) : (
                    <></>
                  )
                }
              />
            </Box>
          </Can>
        </Box>
        <Box display="flex" flexDirection="column">
          <CustomersDataGrid
            isDebtFacilityVisible
            isMultiSelectEnabled
            isSurveillanceStatusVisible
            customers={customers}
            selectedCompanyIds={selectedCompanyIds}
            setSelectedCompanyIds={setSelectedCompanyIds}
          />
        </Box>
      </Box>
    </Container>
  );
}

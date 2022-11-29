import { Box, Checkbox, FormControlLabel, TextField } from "@material-ui/core";
import CreateCustomerModal from "components/Customer/CreateCustomerModal";
import CustomersDataGrid from "components/Customer/CustomersDataGrid";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  CustomersWithMetadataFragment,
  useGetActiveCustomersWithMetadataQuery,
  useGetCustomersWithMetadataQuery,
} from "generated/graphql";
import { useFilterCustomersByFragment } from "hooks/useFilterCustomers";
import { Action, check } from "lib/auth/rbac-rules";
import { todayAsDateStringServer } from "lib/date";
import { ChangeEvent, useContext, useMemo, useState } from "react";

export default function CompaniesCustomersTab() {
  const [isActiveSelected, setIsActiveSelected] = useState(true);

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Companies["id"]>(
    []
  );

  const {
    user: { role },
  } = useContext(CurrentUserContext);

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

  return (
    <Box mt={2}>
      <Box
        display="flex"
        style={{ marginBottom: "1rem" }}
        justifyContent="space-between"
      >
        <Box display="flex">
          <TextField
            autoFocus
            label="Search by customer identifier or name"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
            style={{ width: 300 }}
          />
          <Box pt={1.5} ml={3}>
            <FormControlLabel
              control={
                <Checkbox
                  data-cy={"is-customer-active-checkbox"}
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
        <Box display="flex" flexDirection="row-reverse">
          {check(role, Action.EditCustomerSettings) && (
            <Box>
              <ModalButton
                dataCy={"create-customer-button"}
                label={"Create Customer"}
                color={"primary"}
                modal={({ handleClose }) => (
                  <CreateCustomerModal
                    handleClose={() => {
                      isActiveSelected ? refetchAllData() : refetchActiveData();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          )}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <CustomersDataGrid
          customers={customers}
          selectedCompanyIds={selectedCompanyIds}
          setSelectedCompanyIds={setSelectedCompanyIds}
        />
      </Box>
    </Box>
  );
}

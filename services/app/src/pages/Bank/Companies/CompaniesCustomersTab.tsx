import { Box, InputAdornment, TextField } from "@material-ui/core";
import CompaniesCustomersDataGrid from "components/Customer/CompaniesCustomersDataGrid";
import CreateCustomerModal from "components/Customer/CreateCustomerModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetCustomersWithMetadataQuery } from "generated/graphql";
import { SearchIcon } from "icons";
import { Action, check } from "lib/auth/rbac-rules";
import { todayAsDateStringServer } from "lib/date";
import { filter } from "lodash";
import { useContext, useMemo, useState } from "react";

interface Props {
  setSelectedTabIndex: (index: number) => void;
}

export default function CompaniesCustomersTab({ setSelectedTabIndex }: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data: allData, error: allError } = useGetCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (allError) {
    console.error({ allError });
    alert(`Error in query (details in console): ${allError.message}`);
  }

  const [searchQuery, setSearchQuery] = useState("");

  const customers = useMemo(
    () =>
      filter(
        allData?.customers || [],
        (company) =>
          company.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0 ||
          (company?.dba_name || "")
            .toLowerCase()
            .indexOf(searchQuery.toLowerCase()) >= 0 ||
          (company?.identifier || "")
            .toLowerCase()
            .indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, allData?.customers]
  );

  return (
    <Box>
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
                    handleClose();
                  }}
                  setSelectedTabIndex={setSelectedTabIndex}
                />
              )}
            />
          </Box>
        )}
      </Box>
      <Box display="flex" mb={4}>
        <TextField
          autoFocus
          label="Search"
          value={searchQuery}
          onChange={({ target: { value } }) => setSearchQuery(value)}
          style={{ width: 430 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box>
        <CompaniesCustomersDataGrid customers={customers} />
      </Box>
    </Box>
  );
}

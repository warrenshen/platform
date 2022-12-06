import { Box, InputAdornment, TextField } from "@material-ui/core";
import CreateCompanyModal from "components/Customer/CreateCompanyModal";
import ParentCompaniesDataGrid from "components/Customer/ParentCompaniesDataGrid";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetParentCompaniesQuery } from "generated/graphql";
import { SearchIcon } from "icons";
import { Action, check } from "lib/auth/rbac-rules";
import { filter } from "lodash";
import { useContext, useMemo, useState } from "react";

export default function CompaniesParentCompaniesTab() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data } = useGetParentCompaniesQuery({
    fetchPolicy: "network-only",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const companies = useMemo(
    () =>
      filter(
        data?.parent_companies || [],
        (company) =>
          company.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, data?.parent_companies]
  );

  return (
    <Box>
      <Box display="flex" flexDirection="row-reverse">
        {check(role, Action.EditCustomerSettings) && (
          <Box>
            <ModalButton
              dataCy={"create-company-button"}
              label={"Create Company"}
              color={"primary"}
              modal={({ handleClose }) => (
                <CreateCompanyModal
                  handleClose={() => {
                    handleClose();
                  }}
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
        <ParentCompaniesDataGrid parentCompanies={companies} />
      </Box>
    </Box>
  );
}

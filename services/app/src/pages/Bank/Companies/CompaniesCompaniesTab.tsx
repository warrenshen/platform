import { Box, InputAdornment, TextField } from "@material-ui/core";
import CompaniesCompaniesDataGrid from "components/Customer/CompaniesCompaniesDataGrid";
import CreateCompanyMiniModal from "components/Customer/CreateCompanyMiniModal";
import ModalButton from "components/Shared/Modal/ModalButton";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetAllCompaniesWithMetadataQuery } from "generated/graphql";
import { SearchIcon } from "icons";
import { Action, check } from "lib/auth/rbac-rules";
import { todayAsDateStringServer } from "lib/date";
import { filter } from "lodash";
import { useContext, useMemo, useState } from "react";

export default function CompaniesCompaniesTab() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data: allData, error: allError } =
    useGetAllCompaniesWithMetadataQuery({
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

  const companies = useMemo(
    () =>
      filter(
        allData?.companies || [],
        (company) =>
          company.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0 ||
          (company?.dba_name || "")
            .toLowerCase()
            .indexOf(searchQuery.toLowerCase()) >= 0 ||
          (company?.identifier || "")
            .toLowerCase()
            .indexOf(searchQuery.toLowerCase()) >= 0
      ),
    [searchQuery, allData?.companies]
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
                <CreateCompanyMiniModal
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
        <CompaniesCompaniesDataGrid companies={companies} />
      </Box>
    </Box>
  );
}

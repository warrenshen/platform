import { Box, InputAdornment, TextField } from "@material-ui/core";
import { DEFAULT_BESPOKE_CATALOG_QUERY_SIZE } from "components/BespokeCatalog/constants";
import EditBespokeCatalogEntryModal from "components/BespokeCatalog/EditBespokeCatalogEntryModal";
import MetrcToBespokeCatalogSkusDataGrid from "components/BespokeCatalog/MetrcToBespokeCatalogSkusDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  MetrcToBespokeCatalogSkuFragment,
  useGetMetrcToBespokeCatalogSkusByProductNameLazyQuery,
} from "generated/graphql";
import { SearchIcon } from "icons";
import { Action } from "lib/auth/rbac-rules";
import { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  margin-top: 36px;
`;

const RecentlyAddedTab = () => {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankAdminOrReadOnlyUser = isRoleBankUser(role);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [
    loadBespokeCatalogEntriesByProductName,
    { data: bespokeCatalogEntriesByProductNameData },
  ] = useGetMetrcToBespokeCatalogSkusByProductNameLazyQuery();
  const metrcToBespokeCatalogSkus = useMemo(
    () =>
      bespokeCatalogEntriesByProductNameData?.metrc_to_bespoke_catalog_skus ||
      [],
    [bespokeCatalogEntriesByProductNameData]
  );
  const [selectedEntryIds, setSelectedEntries] = useState<string[]>([]);
  const [isEditEntryModalOpen, setIsEditEntryModalOpen] =
    useState<boolean>(false);

  const handleSelectEntries = useMemo(
    () =>
      ({ selectedRowKeys }: { selectedRowKeys: string[] }) => {
        setSelectedEntries(selectedRowKeys);
      },
    [setSelectedEntries]
  );
  const selectedEntry = useMemo(
    () =>
      selectedEntryIds.length === 1
        ? metrcToBespokeCatalogSkus.find(
            (entry: MetrcToBespokeCatalogSkuFragment) =>
              entry.id === selectedEntryIds[0]
          )
        : null,
    [selectedEntryIds, metrcToBespokeCatalogSkus]
  );

  useEffect(() => {
    handleClickSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickSearch = () => {
    const search_query =
      searchQuery.length === 0 ? "%%" : `%${searchQuery.trim()}%`;
    loadBespokeCatalogEntriesByProductName({
      variables: {
        search_query,
        limit: DEFAULT_BESPOKE_CATALOG_QUERY_SIZE,
      },
    });
  };

  return (
    <Container>
      {selectedEntry && isEditEntryModalOpen && (
        <EditBespokeCatalogEntryModal
          bespokeCatalogEntry={selectedEntry}
          handleClose={() => {
            setSelectedEntries([]);
            setIsEditEntryModalOpen(false);
          }}
        />
      )}
      <Box display="flex" mb={2} justifyContent="space-between">
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
        <PrimaryButton text={"Refetch Results"} onClick={handleClickSearch} />
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>
          Bespoke Catalog Entries
        </Text>
        <Can perform={Action.EditBespokeCatalog}>
          <PrimaryButton
            isDisabled={!selectedEntry}
            text={"Edit Catalog Entry"}
            onClick={() => setIsEditEntryModalOpen(true)}
          />
        </Can>
      </Box>
      <MetrcToBespokeCatalogSkusDataGrid
        metrcToBespokeCatalogSkus={metrcToBespokeCatalogSkus}
        selectedMetricToBespokeCatalogSkuIds={selectedEntryIds}
        isBankAdminUser={isBankAdminOrReadOnlyUser}
        onSelectionChanged={handleSelectEntries}
      />
    </Container>
  );
};

export default RecentlyAddedTab;

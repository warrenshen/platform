import {
  Box,
  InputAdornment,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import CreateBespokeCatalogEntryCompleteModal from "components/ProductCatalog/CreateBespokeCatalogEntryCompleteModal";
import MetrcInventoryPackagesDataGrid from "components/ProductCatalog/MetrcInventoryPackagesDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { MetrcPackageFragment } from "generated/graphql";
import useCustomQuery from "hooks/useCustomQuery";
import useSnackbar from "hooks/useSnackbar";
import { SearchIcon } from "icons";
import { getInventoryPackageData } from "lib/api/productCatalog";
import { Action } from "lib/auth/rbac-rules";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  max-height: 1000px;
  margin-top: 36px;
`;

const InventoryPackagesTab = () => {
  const snackbar = useSnackbar();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [metrcInventoryPackages, setMetrcInventoryPackages] = useState<
    MetrcPackageFragment[]
  >([]);
  const [selectedMetrcInventoryPackages, setSelectedMetrcInventoryPackages] =
    useState<string[]>([]);
  const [matchedProductNames, setMatchedProductNames] = useState<Set<string>>(
    new Set()
  );
  const [
    isCreateUpdateBespokeCatalogEntryModalOpen,
    setIsCreateUpdateBespokeCatalogEntryModalOpen,
  ] = useState<boolean>(false);

  const [getInventoryPackages, { loading: isGetInventoryPackageDataLoading }] =
    useCustomQuery(getInventoryPackageData);

  useEffect(() => {
    handleClickSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickSearch = async () => {
    const product_name_query =
      searchQuery.length === 0 ? "" : `%${searchQuery.trim()}%`;
    const response = await getInventoryPackages({
      params: {
        product_name_query,
      },
    });
    if (response.status === "OK" && response.data) {
      setMetrcInventoryPackages(response.data);
      snackbar.showSuccess("Successfully updated Metrc Inventory Packages");
    } else {
      snackbar.showError(
        `Failed to search for Metrc Inventory Packages: ${response.msg}`
      );
    }
  };

  const handleSelectInventoryPackages = useMemo(
    () =>
      ({ selectedRowKeys }: { selectedRowKeys: string[] }) => {
        setSelectedMetrcInventoryPackages(selectedRowKeys);
      },
    [setSelectedMetrcInventoryPackages]
  );

  const unmatchedInventoryPackages = useMemo(
    () =>
      metrcInventoryPackages.filter(
        (transferPackage) =>
          !matchedProductNames.has(transferPackage.product_name as string)
      ),
    [metrcInventoryPackages, matchedProductNames]
  );

  const selectedMetrcInventoryPackage = useMemo(
    () =>
      selectedMetrcInventoryPackages.length === 1
        ? metrcInventoryPackages.find(
            (inventoryPackage: MetrcPackageFragment) =>
              inventoryPackage.id === selectedMetrcInventoryPackages[0]
          )
        : null,
    [selectedMetrcInventoryPackages, metrcInventoryPackages]
  );

  return (
    <Container>
      {isCreateUpdateBespokeCatalogEntryModalOpen && (
        <CreateBespokeCatalogEntryCompleteModal
          productName={selectedMetrcInventoryPackage?.product_name}
          productCategoryName={
            selectedMetrcInventoryPackage?.product_category_name
          }
          matchedProductNames={matchedProductNames}
          handleClose={() => {
            setSelectedMetrcInventoryPackages([]);
            setIsCreateUpdateBespokeCatalogEntryModalOpen(false);
          }}
          setMatchedProductNames={setMatchedProductNames}
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
      <Box width="100%" minHeight={12}>
        {isGetInventoryPackageDataLoading && <LinearProgress />}
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>
          Incoming Inventory Packages
        </Text>
        <Can perform={Action.UnarchiveLoan}>
          <PrimaryButton
            isDisabled={!selectedMetrcInventoryPackage}
            text={"Create Catalog Entry"}
            onClick={() => setIsCreateUpdateBespokeCatalogEntryModalOpen(true)}
          />
        </Can>
      </Box>
      <MetrcInventoryPackagesDataGrid
        selectedInventoryPackageIds={selectedMetrcInventoryPackages}
        metrcInventoryPackages={unmatchedInventoryPackages}
        onSelectionChanged={handleSelectInventoryPackages}
      />
    </Container>
  );
};

export default InventoryPackagesTab;

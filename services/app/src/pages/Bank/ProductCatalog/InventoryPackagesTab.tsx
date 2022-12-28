import {
  Box,
  InputAdornment,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import CreateBespokeCatalogEntryCompleteModal from "components/ProductCatalog/CreateBespokeCatalogEntryCompleteModal";
import MetrcInventoryPackagesDataGrid from "components/ProductCatalog/MetrcInventoryPackagesDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { MetrcPackageFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useCustomQuery from "hooks/useCustomQuery";
import useSnackbar from "hooks/useSnackbar";
import { SearchIcon } from "icons";
import {
  createInvalidMetrcToBespokeCatalogSkuMutation,
  createSampleMetrcToBespokeCatalogSkuMutation,
  getInventoryPackageData,
} from "lib/api/productCatalog";
import { Action } from "lib/auth/rbac-rules";
import { MetrcToBespokeCatalogSkuConfidenceLabel } from "lib/enum";
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
  const [recentlyAssignedSkuGroupIds, setRecentlyAssignedSkuGroupIds] =
    useState<string[]>([]);
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

  const [
    invalidMetrcToBespokeCatalogSku,
    { loading: isCreateInvalidMetrcToBespokeCatalogSkuLoading },
  ] = useCustomMutation(createInvalidMetrcToBespokeCatalogSkuMutation);

  const handleMarkInvalid = async () => {
    const handleMarkInvalidInput = metrcInventoryPackages
      .filter((inventoryPackage) =>
        selectedMetrcInventoryPackages.includes(inventoryPackage.id)
      )
      .map((inventoryPackage) => ({
        product_name: inventoryPackage.product_name,
        product_category_name: inventoryPackage.product_category_name,
        sku_confidence: MetrcToBespokeCatalogSkuConfidenceLabel.Invalid,
      }));
    const response = await invalidMetrcToBespokeCatalogSku({
      variables: handleMarkInvalidInput,
    });
    if (response.status === "OK") {
      setMatchedProductNames(
        new Set([
          ...matchedProductNames,
          ...handleMarkInvalidInput.map(
            (input) => input.product_name as string
          ),
        ])
      );
      snackbar.showSuccess(
        `Successfully marked ${selectedMetrcInventoryPackages.length} Metrc Inventory Packages as invalid`
      );
      setSelectedMetrcInventoryPackages([]);
    } else {
      snackbar.showError(
        `Failed to mark selected Metrc Inventory Packages as invalid: ${response.msg}`
      );
    }
  };

  const [
    createSampleMetrcToBespokeCatalogSku,
    { loading: isCreateSampleMetrcToBespokeCatalogSkuLoading },
  ] = useCustomMutation(createSampleMetrcToBespokeCatalogSkuMutation);

  const handleMarkSample = async () => {
    const handleMarkSampleInput = metrcInventoryPackages
      .filter((inventoryPackage) =>
        selectedMetrcInventoryPackages.includes(inventoryPackage.id)
      )
      .map((inventoryPackage) => ({
        product_name: inventoryPackage.product_name,
        product_category_name: inventoryPackage.product_category_name,
        sku_confidence: MetrcToBespokeCatalogSkuConfidenceLabel.High,
      }));
    const response = await createSampleMetrcToBespokeCatalogSku({
      variables: handleMarkSampleInput,
    });
    if (response.status === "OK") {
      setMatchedProductNames(
        new Set([
          ...matchedProductNames,
          ...handleMarkSampleInput.map((input) => input.product_name as string),
        ])
      );
      snackbar.showSuccess(
        `Successfully marked ${selectedMetrcInventoryPackages.length} Metrc Sales Transactions as samples`
      );
      setSelectedMetrcInventoryPackages([]);
    } else {
      snackbar.showError(
        `Failed to mark selected Metrc Sales Transactions as samples: ${response.msg}`
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
          recentlyAssignedSkuGroupIds={recentlyAssignedSkuGroupIds}
          handleClose={() => {
            setSelectedMetrcInventoryPackages([]);
            setIsCreateUpdateBespokeCatalogEntryModalOpen(false);
          }}
          setMatchedProductNames={setMatchedProductNames}
          setRecentlyAssignedSkuGroupIds={setRecentlyAssignedSkuGroupIds}
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
        <Can perform={Action.EditBespokeCatalog}>
          <Box display="flex">
            <SecondaryButton
              isDisabled={
                selectedMetrcInventoryPackages.length === 0 ||
                isCreateInvalidMetrcToBespokeCatalogSkuLoading
              }
              text={"Mark Invalid"}
              onClick={handleMarkInvalid}
            />
            <SecondaryButton
              isDisabled={
                selectedMetrcInventoryPackages.length === 0 ||
                isCreateSampleMetrcToBespokeCatalogSkuLoading
              }
              text={"Mark as Sample"}
              onClick={handleMarkSample}
            />
            <PrimaryButton
              isDisabled={!selectedMetrcInventoryPackage}
              text={"Create Catalog Entry"}
              onClick={() =>
                setIsCreateUpdateBespokeCatalogEntryModalOpen(true)
              }
            />
          </Box>
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

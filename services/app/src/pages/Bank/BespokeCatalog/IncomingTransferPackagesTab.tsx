import {
  Box,
  InputAdornment,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import CreateBespokeCatalogEntryCompleteModal from "components/BespokeCatalog/CreateBespokeCatalogEntryCompleteModal";
import MetrcTransferPackagesDataGrid from "components/BespokeCatalog/MetrcTransferPackageDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { MetrcTransferPackageFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useCustomQuery from "hooks/useCustomQuery";
import useSnackbar from "hooks/useSnackbar";
import { SearchIcon } from "icons";
import {
  createInvalidMetrcToBespokeCatalogSkuMutation,
  createSampleMetrcToBespokeCatalogSkuMutation,
  getIncomingTransferPackageData,
} from "lib/api/bespokeCatalog";
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

const IncomingTransferPackagesTab = () => {
  const snackbar = useSnackbar();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [metrcTransferPackages, setMetrcTransferPackages] = useState<
    MetrcTransferPackageFragment[]
  >([]);
  const [selectedMetrcTransferPackages, setSelectedMetrcTransferPackages] =
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

  const [
    getIncomingTransferPackages,
    { loading: isGetIncomingTransferPackageDataLoading },
  ] = useCustomQuery(getIncomingTransferPackageData);

  useEffect(() => {
    handleClickSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickSearch = async () => {
    const product_name_query =
      searchQuery.length === 0 ? "" : `%${searchQuery.trim()}%`;
    const response = await getIncomingTransferPackages({
      params: {
        product_name_query,
      },
    });
    if (response.status === "OK" && response.data) {
      setMetrcTransferPackages(response.data);
      snackbar.showSuccess(
        "Successfully updated Metrc Incoming Transfer Packages"
      );
    } else {
      snackbar.showError(
        `Failed to search for Metrc Incoming Transfer Packages: ${response.msg}`
      );
    }
  };

  const [
    invalidMetrcToBespokeCatalogSku,
    { loading: isCreateInvalidMetrcToBespokeCatalogSkuLoading },
  ] = useCustomMutation(createInvalidMetrcToBespokeCatalogSkuMutation);

  const handleMarkInvalid = async () => {
    const handleMarkInvalidInput = metrcTransferPackages
      .filter((transferPackage) =>
        selectedMetrcTransferPackages.includes(transferPackage.id)
      )
      .map((transferPackage) => ({
        product_name: transferPackage.product_name,
        product_category_name: transferPackage.product_category_name,
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
        `Successfully marked ${selectedMetrcTransferPackages.length} Metrc Incoming Transfer Packages as invalid`
      );
      setSelectedMetrcTransferPackages([]);
    } else {
      snackbar.showError(
        `Failed to mark selected Metrc Incoming Transfer Packages as invalid: ${response.msg}`
      );
    }
  };

  const [
    createSampleMetrcToBespokeCatalogSku,
    { loading: isCreateSampleMetrcToBespokeCatalogSkuLoading },
  ] = useCustomMutation(createSampleMetrcToBespokeCatalogSkuMutation);

  const handleMarkSample = async () => {
    const handleMarkSampleInput = metrcTransferPackages
      .filter((transferPackage) =>
        selectedMetrcTransferPackages.includes(transferPackage.id)
      )
      .map((transferPackage) => ({
        product_name: transferPackage.product_name,
        product_category_name: transferPackage.product_category_name,
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
        `Successfully marked ${selectedMetrcTransferPackages.length} Metrc Transfer Packages as samples`
      );
      setSelectedMetrcTransferPackages([]);
    } else {
      snackbar.showError(
        `Failed to mark selected Metrc Transfer Packages as samples: ${response.msg}`
      );
    }
  };

  const handleSelectTransferPackages = useMemo(
    () =>
      ({ selectedRowKeys }: { selectedRowKeys: string[] }) => {
        setSelectedMetrcTransferPackages(selectedRowKeys);
      },
    [setSelectedMetrcTransferPackages]
  );

  const unmatchedTransferPackages = useMemo(
    () =>
      metrcTransferPackages.filter(
        (transferPackage) =>
          !matchedProductNames.has(transferPackage.product_name as string)
      ),
    [metrcTransferPackages, matchedProductNames]
  );

  const selectedMetrcTransferPackage = useMemo(
    () =>
      selectedMetrcTransferPackages.length === 1
        ? metrcTransferPackages.find(
            (transferPackage: MetrcTransferPackageFragment) =>
              transferPackage.id === selectedMetrcTransferPackages[0]
          )
        : null,
    [selectedMetrcTransferPackages, metrcTransferPackages]
  );

  return (
    <Container>
      {isCreateUpdateBespokeCatalogEntryModalOpen && (
        <CreateBespokeCatalogEntryCompleteModal
          productName={selectedMetrcTransferPackage?.product_name}
          productCategoryName={
            selectedMetrcTransferPackage?.product_category_name
          }
          matchedProductNames={matchedProductNames}
          recentlyAssignedSkuGroupIds={recentlyAssignedSkuGroupIds}
          handleClose={() => {
            setSelectedMetrcTransferPackages([]);
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
        {isGetIncomingTransferPackageDataLoading && <LinearProgress />}
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>
          Incoming Transfer Packages
        </Text>
        <Can perform={Action.EditBespokeCatalog}>
          <Box display="flex">
            <SecondaryButton
              isDisabled={
                selectedMetrcTransferPackages.length === 0 ||
                isCreateInvalidMetrcToBespokeCatalogSkuLoading
              }
              text={"Mark Invalid"}
              onClick={handleMarkInvalid}
            />
            <SecondaryButton
              isDisabled={
                selectedMetrcTransferPackages.length === 0 ||
                isCreateSampleMetrcToBespokeCatalogSkuLoading
              }
              text={"Mark as Sample"}
              onClick={handleMarkSample}
            />
            <PrimaryButton
              isDisabled={!selectedMetrcTransferPackage}
              text={"Create Catalog Entry"}
              onClick={() =>
                setIsCreateUpdateBespokeCatalogEntryModalOpen(true)
              }
            />
          </Box>
        </Can>
      </Box>
      <MetrcTransferPackagesDataGrid
        selectedTransferPackageIds={selectedMetrcTransferPackages}
        metrcTransferPackages={unmatchedTransferPackages}
        onSelectionChanged={handleSelectTransferPackages}
      />
    </Container>
  );
};

export default IncomingTransferPackagesTab;

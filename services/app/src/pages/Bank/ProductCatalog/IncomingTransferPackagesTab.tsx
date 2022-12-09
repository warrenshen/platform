import {
  Box,
  InputAdornment,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import CreateBespokeCatalogEntryCompleteModal from "components/ProductCatalog/CreateBespokeCatalogEntryCompleteModal";
import MetrcTransferPackagesDataGrid from "components/ProductCatalog/MetrcTransferPackageDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { MetrcTransferPackageFragment } from "generated/graphql";
import useCustomQuery from "hooks/useCustomQuery";
import useSnackbar from "hooks/useSnackbar";
import { SearchIcon } from "icons";
import { getIncomingTransferPackageData } from "lib/api/productCatalog";
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
          handleClose={() => {
            setSelectedMetrcTransferPackages([]);
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
        {isGetIncomingTransferPackageDataLoading && <LinearProgress />}
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>
          Incoming Transfer Packages
        </Text>
        <Can perform={Action.UnarchiveLoan}>
          <PrimaryButton
            isDisabled={!selectedMetrcTransferPackage}
            text={"Create Catalog Entry"}
            onClick={() => setIsCreateUpdateBespokeCatalogEntryModalOpen(true)}
          />
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

import {
  Box,
  InputAdornment,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import CreateBespokeCatalogEntryCompleteModal from "components/BespokeCatalog/CreateBespokeCatalogEntryCompleteModal";
import MetrcSalesTransactionsDataGrid from "components/BespokeCatalog/MetrcSalesTransactionsDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { MetrcSalesTransactionFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useCustomQuery from "hooks/useCustomQuery";
import useSnackbar from "hooks/useSnackbar";
import { SearchIcon } from "icons";
import {
  createInvalidMetrcToBespokeCatalogSkuMutation,
  createSampleMetrcToBespokeCatalogSkuMutation,
  getSalesTransactionData,
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

const SalesTransactionsTab = () => {
  const snackbar = useSnackbar();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [metrcSalesTransactions, setMetrcSalesTransactions] = useState<
    MetrcSalesTransactionFragment[]
  >([]);
  const [selectedMetrcSalesTransactions, setSelectedMetrcSalesTransactions] =
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

  const [getSalesTransactions, { loading: isGetSalesTransactionDataLoading }] =
    useCustomQuery(getSalesTransactionData);

  useEffect(() => {
    handleClickSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickSearch = async () => {
    const product_name_query =
      searchQuery.length === 0 ? "" : `%${searchQuery.trim()}%`;
    const response = await getSalesTransactions({
      params: {
        product_name_query,
      },
    });
    if (response.status === "OK" && response.data) {
      setMetrcSalesTransactions(response.data);
      snackbar.showSuccess("Successfully updated Metrc Sales Transactions");
    } else {
      snackbar.showError(
        `Failed to search for Metrc Sales Transactions: ${response.msg}`
      );
    }
  };

  const [
    invalidMetrcToBespokeCatalogSku,
    { loading: isCreateInvalidMetrcToBespokeCatalogSkuLoading },
  ] = useCustomMutation(createInvalidMetrcToBespokeCatalogSkuMutation);

  const handleMarkInvalid = async () => {
    const handleMarkInvalidInput = metrcSalesTransactions
      .filter((salesTransaction) =>
        selectedMetrcSalesTransactions.includes(salesTransaction.id)
      )
      .map((salesTransaction) => ({
        product_name: salesTransaction.product_name,
        product_category_name: salesTransaction.product_category_name,
        sku_confidence: MetrcToBespokeCatalogSkuConfidenceLabel.Invalid,
      }));
    const response = await invalidMetrcToBespokeCatalogSku({
      variables: handleMarkInvalidInput,
    });
    if (response.status === "OK") {
      setMatchedProductNames(
        new Set([
          ...matchedProductNames,
          ...handleMarkInvalidInput.map((input) => input.product_name),
        ])
      );
      snackbar.showSuccess(
        `Successfully marked ${selectedMetrcSalesTransactions.length} Metrc Sales Transactions as invalid`
      );
      setSelectedMetrcSalesTransactions([]);
    } else {
      snackbar.showError(
        `Failed to mark selected Metrc Sales Transactions as invalid: ${response.msg}`
      );
    }
  };

  const [
    createSampleMetrcToBespokeCatalogSku,
    { loading: isCreateSampleMetrcToBespokeCatalogSkuLoading },
  ] = useCustomMutation(createSampleMetrcToBespokeCatalogSkuMutation);

  const handleMarkSample = async () => {
    const handleMarkSampleInput = metrcSalesTransactions
      .filter((salesTransaction) =>
        selectedMetrcSalesTransactions.includes(salesTransaction.id)
      )
      .map((salesTransaction) => ({
        product_name: salesTransaction.product_name,
        product_category_name: salesTransaction.product_category_name,
        sku_confidence: MetrcToBespokeCatalogSkuConfidenceLabel.High,
      }));
    const response = await createSampleMetrcToBespokeCatalogSku({
      variables: handleMarkSampleInput,
    });
    if (response.status === "OK") {
      setMatchedProductNames(
        new Set([
          ...matchedProductNames,
          ...handleMarkSampleInput.map((input) => input.product_name),
        ])
      );
      snackbar.showSuccess(
        `Successfully marked ${selectedMetrcSalesTransactions.length} Metrc Sales Transactions as samples`
      );
      setSelectedMetrcSalesTransactions([]);
    } else {
      snackbar.showError(
        `Failed to mark selected Metrc Sales Transactions as samples: ${response.msg}`
      );
    }
  };

  const handleSelectSalesTransactions = useMemo(
    () =>
      ({ selectedRowKeys }: { selectedRowKeys: string[] }) => {
        setSelectedMetrcSalesTransactions(selectedRowKeys);
      },
    [setSelectedMetrcSalesTransactions]
  );

  const unmatchedSalesTransactions = useMemo(
    () =>
      metrcSalesTransactions.filter(
        (salesTransaction) =>
          !matchedProductNames.has(salesTransaction.product_name as string)
      ),
    [metrcSalesTransactions, matchedProductNames]
  );

  const selectedMetrcSalesTransaction = useMemo(
    () =>
      selectedMetrcSalesTransactions.length === 1
        ? metrcSalesTransactions.find(
            (salesTransaction: MetrcSalesTransactionFragment) =>
              salesTransaction.id === selectedMetrcSalesTransactions[0]
          )
        : null,
    [selectedMetrcSalesTransactions, metrcSalesTransactions]
  );

  return (
    <Container>
      {isCreateUpdateBespokeCatalogEntryModalOpen && (
        <CreateBespokeCatalogEntryCompleteModal
          productName={selectedMetrcSalesTransaction?.product_name}
          productCategoryName={
            selectedMetrcSalesTransaction?.product_category_name
          }
          matchedProductNames={matchedProductNames}
          recentlyAssignedSkuGroupIds={recentlyAssignedSkuGroupIds}
          handleClose={() => {
            setSelectedMetrcSalesTransactions([]);
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
        {isGetSalesTransactionDataLoading && <LinearProgress />}
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>Sales Transactions</Text>
        <Can perform={Action.EditBespokeCatalog}>
          <Box display="flex">
            <SecondaryButton
              isDisabled={
                selectedMetrcSalesTransactions.length === 0 ||
                isCreateInvalidMetrcToBespokeCatalogSkuLoading
              }
              text={"Mark Invalid"}
              onClick={handleMarkInvalid}
            />
            <SecondaryButton
              isDisabled={
                selectedMetrcSalesTransactions.length === 0 ||
                isCreateSampleMetrcToBespokeCatalogSkuLoading
              }
              text={"Mark as Sample"}
              onClick={handleMarkSample}
            />
            <PrimaryButton
              isDisabled={!selectedMetrcSalesTransaction}
              text={"Create Catalog Entry"}
              onClick={() =>
                setIsCreateUpdateBespokeCatalogEntryModalOpen(true)
              }
            />
          </Box>
        </Can>
      </Box>
      <MetrcSalesTransactionsDataGrid
        isExcelExport
        selectedSalesTransactionIds={selectedMetrcSalesTransactions}
        metrcSalesTransactions={unmatchedSalesTransactions}
        onSelectionChanged={handleSelectSalesTransactions}
      />
    </Container>
  );
};

export default SalesTransactionsTab;

import {
  Box,
  InputAdornment,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import CreateBespokeCatalogEntryCompleteModal from "components/ProductCatalog/CreateBespokeCatalogEntryCompleteModal";
import MetrcSalesTransactionsDataGrid from "components/ProductCatalog/MetrcSalesTransactionsDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { MetrcSalesTransactionFragment } from "generated/graphql";
import useCustomQuery from "hooks/useCustomQuery";
import useSnackbar from "hooks/useSnackbar";
import { SearchIcon } from "icons";
import { getSalesTransactionData } from "lib/api/productCatalog";
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
          handleClose={() => {
            setSelectedMetrcSalesTransactions([]);
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
        {isGetSalesTransactionDataLoading && <LinearProgress />}
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>Sales Transactions</Text>
        <PrimaryButton
          isDisabled={!selectedMetrcSalesTransaction}
          text={"Create Catalog Entry"}
          onClick={() => setIsCreateUpdateBespokeCatalogEntryModalOpen(true)}
        />
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

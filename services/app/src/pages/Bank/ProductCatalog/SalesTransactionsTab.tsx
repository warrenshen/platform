import { Box } from "@material-ui/core";
import CreateUpdateBespokeCatalogEntryCompleteModal from "components/ProductCatalog/CreateUpdateBespokeCatalogEntryCompleteModal";
import MetrcSalesTransactionsDataGrid from "components/ProductCatalog/MetrcSalesTransactionsDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { MetrcSalesTransactionFragment } from "generated/graphql";
import { getSalesTransactionData } from "lib/api/productCatalog";
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

const SalesTransactionsTab = () => {
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

  useEffect(() => {
    getSalesTransactionData({}).then((data) => {
      setMetrcSalesTransactions(data.data);
    });
  }, []);

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
        <CreateUpdateBespokeCatalogEntryCompleteModal
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
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>Sales Transactions</Text>
        <Can perform={Action.UnarchiveLoan}>
          <PrimaryButton
            isDisabled={!selectedMetrcSalesTransaction}
            text={"Create Sku"}
            onClick={() => setIsCreateUpdateBespokeCatalogEntryModalOpen(true)}
          />
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

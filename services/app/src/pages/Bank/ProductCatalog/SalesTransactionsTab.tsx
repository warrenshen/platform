import { Box } from "@material-ui/core";
import BespokeCatalogBrandsDataGrid from "components/ProductCatalog/BespokeCatalogBrandsDataGrid";
import BespokeCatalogSkusDataGrid from "components/ProductCatalog/BespokeCatalogSkusDataGrid";
import MetrcSalesTransactionsDataGrid from "components/ProductCatalog/MetrcSalesTransactionsDataGrid";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BespokeCatalogBrandFragment,
  BespokeCatalogSkuFragment,
  MetrcSalesTransactionFragment,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createUpdateMetrcToBespokeCatalogSkuMutation,
  getSalesTransactionData,
} from "lib/api/productCatalog";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import MetrcToBespokeCatalogSkuModal from "./MetrcToBespokeCatalogSkuModal";
import { calculateBrand } from "./utils";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  width: 100%;
  max-height: 1000px;
  margin-top: 36px;
`;

interface Props {
  skus: BespokeCatalogSkuFragment[];
  brands: BespokeCatalogBrandFragment[];
}

const SalesTransactionsTab = ({ skus, brands }: Props) => {
  const snackbar = useSnackbar();
  const [metrcSalesTransactions, setMetrcSalesTransactions] = useState<
    MetrcSalesTransactionFragment[]
  >([]);
  const [selectedMetrcSalesTransactions, setSelectedMetrcSalesTransactions] =
    useState<string[]>([]);
  const [selectedBespokeCatalogSku, setSelectedBespokeCatalogSku] =
    useState<string>();
  const [skuConfidence, setSkuConfidence] = useState<string>("");
  const [matchedProductNames, setMatchedProductNames] = useState<Set<string>>(
    new Set()
  );

  const [createUpdateMetrcToBespokeCatalogSku] = useCustomMutation(
    createUpdateMetrcToBespokeCatalogSkuMutation
  );

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

  const handleSelectSku = ({
    selectedRowKeys,
  }: {
    selectedRowKeys: string[];
  }) => {
    setSelectedBespokeCatalogSku(selectedRowKeys[0]);
  };

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

  const handleNewRow = ({ data }: any) => {
    if (selectedMetrcSalesTransaction) {
      const productName = (
        selectedMetrcSalesTransaction as MetrcSalesTransactionFragment
      ).product_name;
      data.sku = productName;
      data.brand = calculateBrand(productName);
    }
  };

  const handleAssignSalesTransactionToSku = async () => {
    if (selectedMetrcSalesTransaction && selectedBespokeCatalogSku) {
      const response = await createUpdateMetrcToBespokeCatalogSku({
        variables: {
          id: null,
          bespoke_catalog_sku_id: selectedBespokeCatalogSku,
          product_name: selectedMetrcSalesTransaction.product_name,
          product_category_name:
            selectedMetrcSalesTransaction.product_category_name,
          sku_confidence: skuConfidence,
          brand_confidence: null,
        },
      });
      if (response.status !== "OK") {
        snackbar.showError(
          `Could not associate metrc sales transaction to bespoke catalog sku. Message: ${response.msg}`
        );
      } else {
        const newMatchedProductNames = new Set(matchedProductNames);
        newMatchedProductNames.add(
          selectedMetrcSalesTransaction.product_name as string
        );
        setMatchedProductNames(newMatchedProductNames);
        snackbar.showSuccess("Successfully taggeed metrc sales tranaction");
      }
    }
    setSelectedBespokeCatalogSku(undefined);
    setSelectedMetrcSalesTransactions([]);
  };

  return (
    <Container>
      {selectedMetrcSalesTransactions.length > 0 && selectedBespokeCatalogSku && (
        <MetrcToBespokeCatalogSkuModal
          skuConfidence={skuConfidence}
          setSkuConfidence={setSkuConfidence}
          handleClickConfirm={handleAssignSalesTransactionToSku}
          handleClose={() => {
            setSelectedBespokeCatalogSku(undefined);
            setSelectedMetrcSalesTransactions([]);
          }}
        />
      )}
      <Box width={600} mr={3}>
        <Text textVariant={TextVariants.ParagraphLead}>Sales Transactions</Text>
        <MetrcSalesTransactionsDataGrid
          isExcelExport
          selectedSalesTransactionIds={selectedMetrcSalesTransactions}
          metrcSalesTransactions={unmatchedSalesTransactions}
          onSelectionChanged={handleSelectSalesTransactions}
        />
      </Box>
      <Box width={500} mr={3}>
        <Text textVariant={TextVariants.ParagraphLead}>Existing SKUs</Text>
        <BespokeCatalogSkusDataGrid
          bespokeCatalogSkus={skus}
          bespokeCatalogBrands={brands}
          isSingleSelectEnabled
          selectedBespokeCatalogSkuIds={
            selectedBespokeCatalogSku ? [selectedBespokeCatalogSku] : []
          }
          onSelectionChanged={handleSelectSku}
          onInitNewRow={handleNewRow}
        />
      </Box>
      <Box>
        <Text textVariant={TextVariants.ParagraphLead}>Existing Brands</Text>
        <BespokeCatalogBrandsDataGrid bespokeCatalogBrands={brands} />
      </Box>
    </Container>
  );
};

export default SalesTransactionsTab;

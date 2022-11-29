import { Box } from "@material-ui/core";
import BespokeCatalogBrandsDataGrid from "components/ProductCatalog/BespokeCatalogBrandsDataGrid";
import BespokeCatalogSkusDataGrid from "components/ProductCatalog/BespokeCatalogSkusDataGrid";
import MetrcTransferPackagesDataGrid from "components/ProductCatalog/MetrcTransferPackageDataGrid";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BespokeCatalogBrandFragment,
  BespokeCatalogSkuFragment,
  MetrcTransferPackageFragment,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createUpdateMetrcToBespokeCatalogSkuMutation,
  getIncomingTransferPackageData,
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

const IncomingTransferPackagesTab = ({ skus, brands }: Props) => {
  const snackbar = useSnackbar();
  const [metrcTransferPackages, setMetrcTransferPackages] = useState<
    MetrcTransferPackageFragment[]
  >([]);
  const [selectedMetrcTransferPackages, setSelectedMetrcTransferPackages] =
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
    getIncomingTransferPackageData({}).then((data) => {
      setMetrcTransferPackages(data.data);
    });
  }, []);

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

  const handleSelectionChanged = ({
    selectedRowKeys,
  }: {
    selectedRowKeys: string[];
  }) => {
    setSelectedBespokeCatalogSku(selectedRowKeys[0]);
  };

  const selectedMetrcTransferPackage = useMemo(
    () =>
      selectedMetrcTransferPackages.length === 1
        ? metrcTransferPackages.find(
            (salesTransaction: MetrcTransferPackageFragment) =>
              salesTransaction.id === selectedMetrcTransferPackages[0]
          )
        : null,
    [selectedMetrcTransferPackages, metrcTransferPackages]
  );

  const handleNewRow = ({ data }: any) => {
    if (selectedMetrcTransferPackage) {
      const productName = (
        selectedMetrcTransferPackage as MetrcTransferPackageFragment
      ).product_name;
      data.sku = productName;
      data.brand = calculateBrand(productName || "");
    }
  };

  const handleAssignTransferPackageToSku = async () => {
    if (selectedMetrcTransferPackage && selectedBespokeCatalogSku) {
      const response = await createUpdateMetrcToBespokeCatalogSku({
        variables: {
          id: null,
          bespoke_catalog_sku_id: selectedBespokeCatalogSku,
          product_name: selectedMetrcTransferPackage.product_name,
          product_category_name:
            selectedMetrcTransferPackage.product_category_name,
          sku_confidence: skuConfidence,
          brand_confidence: null,
        },
      });
      if (response.status !== "OK") {
        snackbar.showError(
          `Could not associate metrc incoming transfer package to bespoke catalog sku. Message: ${response.msg}`
        );
      } else {
        const newMatchedProductNames = new Set(matchedProductNames);
        newMatchedProductNames.add(
          selectedMetrcTransferPackage.product_name as string
        );
        setMatchedProductNames(newMatchedProductNames);
        snackbar.showSuccess(
          "Successfully taggeed metrc incoming transfer package"
        );
      }
    }
    setSelectedBespokeCatalogSku(undefined);
    setSelectedMetrcTransferPackages([]);
  };

  return (
    <Container>
      {selectedMetrcTransferPackages.length > 0 && selectedBespokeCatalogSku && (
        <MetrcToBespokeCatalogSkuModal
          skuConfidence={skuConfidence}
          setSkuConfidence={setSkuConfidence}
          handleClickConfirm={handleAssignTransferPackageToSku}
          handleClose={() => {
            setSelectedBespokeCatalogSku(undefined);
            setSelectedMetrcTransferPackages([]);
          }}
        />
      )}
      <Box width={600} mr={3}>
        <Text textVariant={TextVariants.ParagraphLead}>
          Incoming Transfer Packages
        </Text>
        <MetrcTransferPackagesDataGrid
          selectedTransferPackageIds={selectedMetrcTransferPackages}
          metrcTransferPackages={unmatchedTransferPackages}
          onSelectionChanged={handleSelectTransferPackages}
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
          onSelectionChanged={handleSelectionChanged}
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

export default IncomingTransferPackagesTab;

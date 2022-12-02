import { Box } from "@material-ui/core";
import BespokeCatalogBrandsDataGrid from "components/ProductCatalog/BespokeCatalogBrandsDataGrid";
import BespokeCatalogSkusDataGrid from "components/ProductCatalog/BespokeCatalogSkusDataGrid";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  useGetBespokeCatalogBrandsSubscription,
  useGetBespokeCatalogSkusSubscription,
} from "generated/graphql";
import { useMemo } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  margin-top: 36px;
`;

const SkusAndBrands = () => {
  const { data: dataSkus } = useGetBespokeCatalogSkusSubscription();
  const { data: dataBrands } = useGetBespokeCatalogBrandsSubscription();
  const skus = useMemo(() => dataSkus?.bespoke_catalog_skus || [], [dataSkus]);
  const brands = useMemo(
    () => dataBrands?.bespoke_catalog_brands || [],
    [dataBrands]
  );

  return (
    <Container>
      <Text textVariant={TextVariants.ParagraphLead}>SKUs</Text>
      <Box display="flex" className="product-catalog-data-grids">
        <BespokeCatalogSkusDataGrid bespokeCatalogSkus={skus} />
      </Box>
      <Box mt={3}>
        <Text textVariant={TextVariants.ParagraphLead}>Brands</Text>
        <BespokeCatalogBrandsDataGrid bespokeCatalogBrands={brands} />
      </Box>
    </Container>
  );
};

export default SkusAndBrands;

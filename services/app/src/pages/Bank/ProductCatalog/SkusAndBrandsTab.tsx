import { Box } from "@material-ui/core";
import BespokeCatalogBrandsDataGrid from "components/ProductCatalog/BespokeCatalogBrandsDataGrid";
import BespokeCatalogSkusDataGrid from "components/ProductCatalog/BespokeCatalogSkusDataGrid";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BespokeCatalogBrandFragment,
  BespokeCatalogSkuFragment,
} from "generated/graphql";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  margin-top: 36px;
`;

interface Props {
  skus: BespokeCatalogSkuFragment[];
  brands: BespokeCatalogBrandFragment[];
}

const SkusAndBrands = ({ skus, brands }: Props) => {
  return (
    <Container>
      <Text textVariant={TextVariants.ParagraphLead}>SKUs</Text>
      <Box display="flex" className="product-catalog-data-grids">
        <BespokeCatalogSkusDataGrid
          bespokeCatalogSkus={skus}
          bespokeCatalogBrands={brands}
        />
      </Box>
      <Box mt={3}>
        <Text textVariant={TextVariants.ParagraphLead}>Brands</Text>
        <BespokeCatalogBrandsDataGrid bespokeCatalogBrands={brands} />
      </Box>
    </Container>
  );
};

export default SkusAndBrands;

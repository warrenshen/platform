import MetrcToBespokeCatalogSkusDataGrid from "components/ProductCatalog/MetrcToBespokeCatalogSkusDataGrid";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { useGetMetrcToBespokeCatalogSkusSubscription } from "generated/graphql";
import { useMemo } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  margin-top: 36px;
`;

const RecentlyAddedTab = () => {
  const { data } = useGetMetrcToBespokeCatalogSkusSubscription();
  const metrcToBespokeCatalogSkus = useMemo(
    () => data?.metrc_to_bespoke_catalog_skus || [],
    [data]
  );

  return (
    <Container>
      <Text textVariant={TextVariants.ParagraphLead}>
        Matched Metrc product names to Bespoke SKUs
      </Text>
      <MetrcToBespokeCatalogSkusDataGrid
        metrcToBespokeCatalogSkus={metrcToBespokeCatalogSkus}
      />
    </Container>
  );
};

export default RecentlyAddedTab;

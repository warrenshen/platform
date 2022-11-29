import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import {
  useGetBespokeCatalogBrandsSubscription,
  useGetBespokeCatalogSkusSubscription,
} from "generated/graphql";
import { ProductCatalogTabLabels } from "lib/enum";
import { useMemo, useState } from "react";
import styled from "styled-components";

import IncomingTransferPackagesTab from "./IncomingTransferPackagesTab";
import RecentlyAddedTab from "./RecentlyAddedTab";
import SalesTransactionsTab from "./SalesTransactionsTab";
import SkusAndBrandsTab from "./SkusAndBrandsTab";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;

const BankProductCatalogPage = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const { data: dataSkus } = useGetBespokeCatalogSkusSubscription();
  const { data: dataBrands } = useGetBespokeCatalogBrandsSubscription();

  const skus = useMemo(() => dataSkus?.bespoke_catalog_skus || [], [dataSkus]);
  const brands = useMemo(
    () => dataBrands?.bespoke_catalog_brands || [],
    [dataBrands]
  );

  return (
    <Page appBarTitle={"Product Catalog"}>
      <PageContent title={"Product Catalog"}>
        <Container>
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            {ProductCatalogTabLabels.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
          {selectedTabIndex === 0 ? (
            <SalesTransactionsTab skus={skus} brands={brands} />
          ) : selectedTabIndex === 1 ? (
            <IncomingTransferPackagesTab skus={skus} brands={brands} />
          ) : selectedTabIndex === 2 ? (
            <RecentlyAddedTab />
          ) : (
            <SkusAndBrandsTab skus={skus} brands={brands} />
          )}
        </Container>
      </PageContent>
    </Page>
  );
};

export default BankProductCatalogPage;

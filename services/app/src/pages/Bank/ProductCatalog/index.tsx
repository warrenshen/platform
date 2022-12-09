import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { ProductCatalogTabLabels } from "lib/enum";
import BespokeCatalogTab from "pages/Bank/ProductCatalog/BespokeCatalogTab";
import IncomingTransferPackagesTab from "pages/Bank/ProductCatalog/IncomingTransferPackagesTab";
import InventoryPackagesTab from "pages/Bank/ProductCatalog/InventoryPackagesTab";
import RecentlyAddedTab from "pages/Bank/ProductCatalog/RecentlyAddedTab";
import SalesTransactionsTab from "pages/Bank/ProductCatalog/SalesTransactionsTab";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;

const BankProductCatalogPage = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

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
            <SalesTransactionsTab />
          ) : selectedTabIndex === 1 ? (
            <IncomingTransferPackagesTab />
          ) : selectedTabIndex === 2 ? (
            <InventoryPackagesTab />
          ) : selectedTabIndex === 3 ? (
            <RecentlyAddedTab />
          ) : (
            <BespokeCatalogTab />
          )}
        </Container>
      </PageContent>
    </Page>
  );
};

export default BankProductCatalogPage;

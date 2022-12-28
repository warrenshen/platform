import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { BespokeCatalogTabLabels } from "lib/enum";
import BespokeCatalogTab from "pages/Bank/BespokeCatalog/BespokeCatalogTab";
import IncomingTransferPackagesTab from "pages/Bank/BespokeCatalog/IncomingTransferPackagesTab";
import InventoryPackagesTab from "pages/Bank/BespokeCatalog/InventoryPackagesTab";
import RecentlyAddedTab from "pages/Bank/BespokeCatalog/RecentlyAddedTab";
import SalesTransactionsTab from "pages/Bank/BespokeCatalog/SalesTransactionsTab";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;

const BankBespokeCatalogPage = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <PageContent title={"Bespoke Catalog"}>
      <Container>
        <Tabs
          value={selectedTabIndex}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
        >
          {BespokeCatalogTabLabels.map((label) => (
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
  );
};

export default BankBespokeCatalogPage;

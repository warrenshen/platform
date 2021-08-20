import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { Companies } from "generated/graphql";
import CustomerMetrcActivePackagesTab from "pages/Customer/Metrc/MetrcActivePackagesTab";
import CustomerMetrcTransferPackagesTab from "pages/Customer/Metrc/MetrcTransferPackagesTab";
import CustomerMetrcTransfersTab from "pages/Customer/Metrc/MetrcTransfersTab";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
}

export default function CustomerMetrcPageContent({ companyId }: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <PageContent title={"Metrc"}>
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Metrc Transfers" />
        <Tab label="Metrc Transfer Packages" />
        <Tab label="Metrc Inventory (Active Packages)" />
      </Tabs>
      {selectedTabIndex === 0 ? (
        <CustomerMetrcTransfersTab companyId={companyId} />
      ) : selectedTabIndex === 1 ? (
        <CustomerMetrcTransferPackagesTab companyId={companyId} />
      ) : (
        <CustomerMetrcActivePackagesTab companyId={companyId} />
      )}
    </PageContent>
  );
}

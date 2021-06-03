import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { Companies } from "generated/graphql";
import CustomerMetrcPackagesTab from "pages/Customer/Metrc/MetrcPackagesTab";
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
        <Tab label="Metrc Packages" />
      </Tabs>
      {selectedTabIndex === 0 ? (
        <CustomerMetrcTransfersTab companyId={companyId} />
      ) : (
        <CustomerMetrcPackagesTab companyId={companyId} />
      )}
    </PageContent>
  );
}

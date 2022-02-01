import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { Companies } from "generated/graphql";
import CompanyMetrcActivePackagesTab from "pages/Bank/Company/Metrc/MetrcActivePackagesTab";
import CompanyMetrcApiKeysTab from "pages/Bank/Company/Metrc/MetrcApiKeysTab";
import CompanyMetrcTransferPackagesTab from "pages/Bank/Company/Metrc/MetrcTransferPackagesTab";
import CompanyMetrcTransfersTab from "pages/Bank/Company/Metrc/MetrcTransfersTab";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
}

export default function BankCompanyMetrcPageContent({ companyId }: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <PageContent title={"Metrc"}>
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Metrc API Keys" />
        <Tab label="Metrc Transfers" />
        <Tab label="Metrc Transfer Packages" />
        <Tab label="Metrc Inventory (Active Packages)" />
      </Tabs>
      {selectedTabIndex === 0 ? (
        <CompanyMetrcApiKeysTab companyId={companyId} />
      ) : selectedTabIndex === 1 ? (
        <CompanyMetrcTransfersTab companyId={companyId} />
      ) : selectedTabIndex === 2 ? (
        <CompanyMetrcTransferPackagesTab companyId={companyId} />
      ) : (
        <CompanyMetrcActivePackagesTab companyId={companyId} />
      )}
    </PageContent>
  );
}

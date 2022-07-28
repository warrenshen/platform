import { Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { BankVendorsTabLabel, BankVendorsTabLabels } from "lib/enum";
import VendorsAllTab from "pages/Bank/Vendors/VendorsAllTab";
import VendorsApprovedTab from "pages/Bank/Vendors/VendorsApprovedTab";
import VendorsNotApprovedTab from "pages/Bank/Vendors/VendorsNotApprovedTab";
import { useState } from "react";

const BankVendorComponentMap: {
  [key in BankVendorsTabLabel]: JSX.Element;
} = {
  [BankVendorsTabLabel.NotApproved]: <VendorsNotApprovedTab />,
  [BankVendorsTabLabel.Approved]: <VendorsApprovedTab />,
  [BankVendorsTabLabel.All]: <VendorsAllTab />,
};

export default function BankVendorsPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Vendors"}>
      <PageContent title={"Vendors"}>
        <Tabs
          value={selectedTabIndex}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_: any, value: number) => setSelectedTabIndex(value)}
        >
          {BankVendorsTabLabels.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
        {BankVendorComponentMap[BankVendorsTabLabels[selectedTabIndex]]}
      </PageContent>
    </Page>
  );
}

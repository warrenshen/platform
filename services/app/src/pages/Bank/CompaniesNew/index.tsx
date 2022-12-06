import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { BankCompaniesTabLabel, BankCompaniesTabLabels } from "lib/enum";
import CompaniesCompaniesTab from "pages/Bank/CompaniesNew/CompaniesCompaniesTab";
import CompaniesCustomersTab from "pages/Bank/CompaniesNew/CompaniesCustomersTab";
import CompaniesParentCompaniesTab from "pages/Bank/CompaniesNew/CompaniesParentCompaniesTab";
import CompaniesPayorsTab from "pages/Bank/CompaniesNew/CompaniesPayorsTab";
import CompaniesVendorsTab from "pages/Bank/CompaniesNew/CompaniesVendorsTab";
import { useState } from "react";

const CompaniesComponentMap: {
  [key in BankCompaniesTabLabel]: JSX.Element;
} = {
  [BankCompaniesTabLabel.Customers]: <CompaniesCustomersTab />,
  [BankCompaniesTabLabel.Vendors]: <CompaniesVendorsTab />,
  [BankCompaniesTabLabel.Payors]: <CompaniesPayorsTab />,
  [BankCompaniesTabLabel.Companies]: <CompaniesCompaniesTab />,
  [BankCompaniesTabLabel.ParentCompanies]: <CompaniesParentCompaniesTab />,
};

export default function BankCompaniesNewPage() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Companies"}>
      <PageContent title={"Companies"}>
        <Box flex={1} display="flex" flexDirection="column" width="100%">
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_event: any, value: number) =>
              setSelectedTabIndex(value)
            }
          >
            <Tab label={`${BankCompaniesTabLabel.Customers}`} />
            <Tab label={`${BankCompaniesTabLabel.Vendors}`} />
            <Tab label={`${BankCompaniesTabLabel.Payors}`} />
            <Tab label={`${BankCompaniesTabLabel.Companies}`} />
            <Tab label={BankCompaniesTabLabel.ParentCompanies} />
          </Tabs>
          {CompaniesComponentMap[BankCompaniesTabLabels[selectedTabIndex]]}
        </Box>
      </PageContent>
    </Page>
  );
}

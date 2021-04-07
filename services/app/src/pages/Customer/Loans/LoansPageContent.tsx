import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { ProductTypeEnum } from "generated/graphql";
import CustomerLoansActiveTab from "pages/Customer/Loans/LoansActiveTab";
import CustomerLoansClosedTab from "pages/Customer/Loans/LoansClosedTab";
import { useState } from "react";

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function CustomerLoansPageContent({ companyId, productType }: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <PageContent title={"Loans"}>
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Active Loans" />
        <Tab label="Closed Loans" />
      </Tabs>
      {selectedTabIndex === 0 ? (
        <CustomerLoansActiveTab
          companyId={companyId}
          productType={productType}
        />
      ) : (
        <CustomerLoansClosedTab
          companyId={companyId}
          productType={productType}
        />
      )}
    </PageContent>
  );
}

export default CustomerLoansPageContent;

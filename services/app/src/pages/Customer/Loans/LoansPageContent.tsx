import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { ProductTypeEnum } from "lib/enum";
import CustomerLoansActiveTab from "pages/Customer/Loans/LoansActiveTab";
import CustomerLoansClosedTab from "pages/Customer/Loans/LoansClosedTab";
import { useState } from "react";

interface Props {
  companyId: string;
  productType: ProductTypeEnum | null;
  isActiveContract: boolean | null;
}

export default function CustomerLoansPageContent({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return !!productType && isActiveContract !== null ? (
    <PageContent
      title={"Loans"}
      subtitle={
        "Monitor and make payments toward active loans and view historical loans."
      }
    >
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Active" />
        <Tab label="Closed" />
      </Tabs>
      {selectedTabIndex === 0 ? (
        <CustomerLoansActiveTab
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      ) : (
        <CustomerLoansClosedTab
          companyId={companyId}
          productType={productType}
        />
      )}
    </PageContent>
  ) : null;
}

import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { ProductTypeEnum } from "lib/enum";
import CustomerLoansActiveTabNew from "pages/Customer/LoansNew/LoansActiveTabNew";
import CustomerLoansClosedTabNew from "pages/Customer/LoansNew/LoansClosedTabNew";
import { useState } from "react";

interface Props {
  companyId: string;
  productType: ProductTypeEnum | null;
  isActiveContract: boolean | null;
}

export default function CustomerLoansPageContentNew({
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
        <CustomerLoansActiveTabNew
          companyId={companyId}
          productType={productType}
          isActiveContract={isActiveContract}
        />
      ) : (
        <CustomerLoansClosedTabNew
          companyId={companyId}
          productType={productType}
        />
      )}
    </PageContent>
  ) : null;
}

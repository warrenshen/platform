import { Tab, Tabs } from "@material-ui/core";
import PageContent from "components/Shared/Page/PageContent";
import { Companies } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import CustomerInvoicesClosedTab from "pages/Customer/Invoices/InvoicesClosedTab";
import CustomerInvoicesOpenTab from "pages/Customer/Invoices/InvoicesOpenTab";
import { useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
}

export default function InvoicesFundedUnfundedList({
  companyId,
  productType,
}: Props) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return !!productType ? (
    <PageContent
      title={"Invoices"}
      subtitle={
        "Create new invoices, edit existing invoices, and request financing for approved invoices."
      }
    >
      <Tabs
        value={selectedTabIndex}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_event: any, value: number) => setSelectedTabIndex(value)}
      >
        <Tab label="Active Invoices" />
        <Tab label="Closed Invoices" />
      </Tabs>
      {selectedTabIndex === 0 ? (
        <CustomerInvoicesOpenTab
          companyId={companyId}
          productType={productType}
        />
      ) : (
        <CustomerInvoicesClosedTab companyId={companyId} />
      )}
    </PageContent>
  ) : null;
}

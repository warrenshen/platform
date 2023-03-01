import { Box, Tab, Tabs } from "@material-ui/core";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { VendorPurchaseOrdersTabLabels } from "lib/enum";
import { getDataCyForTabLabel } from "lib/utils/utils";
import VendorPurchaseOrdersActiveTab from "pages/Vendor/PurchaseOrders/VendorPurchaseOrdersActiveTab";
import VendorPurchaseOrdersArchivedTab from "pages/Vendor/PurchaseOrders/VendorPurchaseOrdersArchivedTab";
import { useContext, useState } from "react";

const VendorPurchaseOrdersPage = () => {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <Page appBarTitle={"Purchase Orders"}>
      <PageContent title={"Purchase Orders"}>
        <Box flex={1} display="flex" flexDirection="column" width="100%">
          <Tabs
            value={selectedTabIndex}
            indicatorColor="primary"
            textColor="primary"
            onChange={(_: any, value: number) => setSelectedTabIndex(value)}
          >
            {VendorPurchaseOrdersTabLabels.map((label) => (
              <Tab
                // Replace space with underscore and change to lower case
                // eg:- Not Confirmed Pos to not-confirmed-pos
                data-cy={`${getDataCyForTabLabel(label)}-tab`}
                key={label}
                label={label}
              />
            ))}
          </Tabs>
          {selectedTabIndex === 0 ? (
            <VendorPurchaseOrdersActiveTab vendorId={companyId} />
          ) : (
            <VendorPurchaseOrdersArchivedTab vendorId={companyId} />
          )}
        </Box>
      </PageContent>
    </Page>
  );
};

export default VendorPurchaseOrdersPage;

import { Box } from "@material-ui/core";
import BespokeCatalogBrandsDataGrid from "components/ProductCatalog/BespokeCatalogBrandsDataGrid";
import BespokeCatalogSkusDataGrid from "components/ProductCatalog/BespokeCatalogSkusDataGrid";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import {
  useGetBespokeCatalogBrandsSubscription,
  useGetBespokeCatalogSkusSubscription,
} from "generated/graphql";

const BankProductCatalogPage = () => {
  const { data: dataSkus } = useGetBespokeCatalogSkusSubscription();
  const { data: dataBrands } = useGetBespokeCatalogBrandsSubscription();

  // TODO: set up initial route for https://www.notion.so/bespokefinancial/Set-up-api-server-to-query-Google-BQ-3c2d68dbb7444f8187522bb13e00b0b2
  //   useEffect(() => {
  //     getBQData({}).then((data) => {
  //       console.log({ data });
  //       setMetrcTransferPackages(data.data);
  //     });
  //   }, []);

  return (
    <Page appBarTitle={"Product Catalog"}>
      <PageContent title={"Product Catalog"}>
        <Box display="flex" className="product-catalog-data-grids">
          <BespokeCatalogSkusDataGrid
            bespokeCatalogSkus={dataSkus?.bespoke_catalog_skus || []}
            bespokeCatalogBrands={dataBrands?.bespoke_catalog_brands || []}
          />
        </Box>
        <Box mt={3}>
          <BespokeCatalogBrandsDataGrid
            bespokeCatalogBrands={dataBrands?.bespoke_catalog_brands || []}
          />
        </Box>
      </PageContent>
    </Page>
  );
};

export default BankProductCatalogPage;

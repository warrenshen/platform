import { Box } from "@material-ui/core";
import AddButton from "components/Customer/AddCustomer/AddCustomerButton";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import Page from "components/Shared/Page";
import { ProductTypeEnum, useCustomersForBankQuery } from "generated/graphql";
import { ProductTypeToLabel } from "lib/enum";
import { bankRoutes } from "lib/routes";
import { sortBy } from "lodash";
import { useRouteMatch } from "react-router-dom";

function BankCustomersPage() {
  const { url } = useRouteMatch();
  const { data } = useCustomersForBankQuery();

  if (!data || !data.companies) {
    return null;
  }

  const customerNameCellRenderer = ({
    value,
    data,
  }: {
    value: string;
    data: any;
  }) => (
    <ClickableDataGridCell
      url={`${url}/${data.id}${bankRoutes.customer.overview}`}
      label={value}
    />
  );

  const productTypeCellRenderer = ({ data }: { data: any }) =>
    data.contract
      ? ProductTypeToLabel[data.contract.product_type as ProductTypeEnum]
      : "Product Type TBD";

  const adressCellRenderer = ({ data }: { data: any }) =>
    `${data.address}${data.city ? `, ${data.city}, ` : ""}${
      data.state ? `, ${data.state}` : ""
    }`;

  const columns = [
    {
      dataField: "name",
      caption: "Customer Name",
      cellRender: customerNameCellRenderer,
    },
    {
      dataField: "contract.product_type",
      caption: "Product Type",
      cellRender: productTypeCellRenderer,
    },
    {
      caption: "Address",
      cellRender: adressCellRenderer,
    },
    {
      dataField: "phone_number",
      caption: "Phone Number",
    },
    {
      dataField: "dba_name",
      caption: "DBA",
    },
    {
      dataField: "employer_identification_number",
      caption: "EIN",
    },
  ];

  const customers = sortBy(data.companies, (company) => company.name);

  return (
    <Page appBarTitle={"Customers"}>
      <Box
        display="flex"
        style={{ marginBottom: "1rem" }}
        flexDirection="row-reverse"
      >
        <AddButton />
      </Box>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <ControlledDataGrid dataSource={customers} columns={columns} pager />
      </Box>
    </Page>
  );
}

export default BankCustomersPage;

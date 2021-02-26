import { Box, Button } from "@material-ui/core";
import CreateCustomerModal from "components/Customer/CreateCustomerModal";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { ProductTypeEnum, useCustomersForBankQuery } from "generated/graphql";
import { ProductTypeToLabel } from "lib/enum";
import { bankRoutes } from "lib/routes";
import { sortBy } from "lodash";
import { Action, check } from "lib/auth/rbac-rules";
import { useState, useContext } from "react";
import { useRouteMatch } from "react-router-dom";

function BankCustomersPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { url } = useRouteMatch();
  const { data, refetch } = useCustomersForBankQuery();

  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(
    false
  );
  const [
    isRunCustomerBalancesModalOpen,
    setIsRunCustomerBalancesModalOpen,
  ] = useState(false);

  const companies = data?.companies || [];

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

  const customers = sortBy(companies, (company) => company.name);

  return (
    <Page appBarTitle={"Customers"}>
      <Box
        display="flex"
        style={{ marginBottom: "1rem" }}
        flexDirection="row-reverse"
      >
        {isRunCustomerBalancesModalOpen && (
          <RunCustomerBalancesModal
            handleClose={() => {
              refetch();
              setIsRunCustomerBalancesModalOpen(false);
            }}
          />
        )}
        {isCreateCustomerModalOpen && (
          <CreateCustomerModal
            handleClose={() => {
              refetch();
              setIsCreateCustomerModalOpen(false);
            }}
          />
        )}
        {check(role, Action.RunBalances) && (
          <Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setIsRunCustomerBalancesModalOpen(true)}
            >
              Run Balances
            </Button>
          </Box>
        )}
        {check(role, Action.ManipulateUser) && (
          <Box mr={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsCreateCustomerModalOpen(true)}
            >
              Create Customer
            </Button>
          </Box>
        )}
      </Box>
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <ControlledDataGrid dataSource={customers} columns={columns} pager />
      </Box>
    </Page>
  );
}

export default BankCustomersPage;

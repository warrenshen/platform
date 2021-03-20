import { Box, Button } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import CreateCustomerModal from "components/Customer/CreateCustomerModal";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import Page from "components/Shared/Page";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ProductTypeEnum,
  useGetCustomersWithMetadataQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ProductTypeToLabel } from "lib/enum";
import { bankRoutes } from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { sortBy } from "lodash";
import { useContext, useState } from "react";
import { useRouteMatch } from "react-router-dom";

function BankCustomersPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { url } = useRouteMatch();
  const { data, refetch } = useGetCustomersWithMetadataQuery();

  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(
    false
  );
  const [
    isRunCustomerBalancesModalOpen,
    setIsRunCustomerBalancesModalOpen,
  ] = useState(false);

  const customers = sortBy(data?.customers || [], (customer) => customer.name);

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
      : "None";

  const columns = [
    {
      dataField: "name",
      caption: "Customer Name",
      minWidth: ColumnWidths.MinWidth,
      cellRender: customerNameCellRenderer,
    },
    {
      dataField: "identifier",
      caption: "Identifier",
      minWidth: ColumnWidths.MinWidth,
      width: ColumnWidths.Type,
    },
    {
      dataField: "contract.product_type",
      caption: "Product Type",
      width: ColumnWidths.Type,
      cellRender: productTypeCellRenderer,
    },
    {
      dataField: "contract_name",
      caption: "Contract Name",
      width: ColumnWidths.Type,
    },
    {
      dataField: "dba_name",
      caption: "DBA",
      minWidth: ColumnWidths.MinWidth,
    },
    {
      dataField: "total_outstanding_principal",
      caption: "Total Outstanding Principal",
      width: ColumnWidths.Currency,
      alignment: "right",
      calculateCellValue: (data: any) =>
        data.financial_summaries[0]
          ? data.financial_summaries[0]?.total_outstanding_principal
          : null,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={
            params.row.data.financial_summaries[0]
              ? params.row.data.financial_summaries[0]
                  ?.total_outstanding_principal
              : null
          }
        />
      ),
    },
    {
      dataField: "total_outstanding_interest",
      caption: "Total Outstanding Interest",
      width: ColumnWidths.Currency,
      alignment: "right",
      calculateCellValue: (data: any) =>
        data.financial_summaries[0]
          ? data.financial_summaries[0]?.total_outstanding_interest
          : null,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={
            params.row.data.financial_summaries[0]
              ? params.row.data.financial_summaries[0]
                  ?.total_outstanding_interest
              : null
          }
        />
      ),
    },
    {
      dataField: "total_outstanding_fees",
      caption: "Total Outstanding Fees",
      width: ColumnWidths.Currency,
      alignment: "right",
      calculateCellValue: (data: any) =>
        data.financial_summaries[0]
          ? data.financial_summaries[0]?.total_outstanding_fees
          : null,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={
            params.row.data.financial_summaries[0]
              ? params.row.data.financial_summaries[0]?.total_outstanding_fees
              : null
          }
        />
      ),
    },
  ];

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
        <ControlledDataGrid
          dataSource={customers}
          columns={columns}
          isExcelExport
          pager
        />
      </Box>
    </Page>
  );
}

export default BankCustomersPage;

import { Box, TextField } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import CreateCustomerModal from "components/Customer/CreateCustomerModal";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  ProductTypeEnum,
  useGetCustomersWithMetadataQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { todayAsDateStringServer } from "lib/date";
import { ProductTypeToLabel } from "lib/enum";
import { bankRoutes } from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { filter, sortBy } from "lodash";
import { useContext, useMemo, useState } from "react";
import { useRouteMatch } from "react-router-dom";

export default function BankCustomersPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { url } = useRouteMatch();
  const { data, refetch, error } = useGetCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [searchQuery, setSearchQuery] = useState("");

  const customers = useMemo(() => {
    const filteredCustomers = filter(
      data?.customers || [],
      (customer) =>
        `${customer.name} ${customer.identifier}`
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return sortBy(filteredCustomers, (customer) => customer.name);
  }, [searchQuery, data?.customers]);

  const columns = useMemo(
    () => [
      {
        dataField: "name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            url={`${url}/${data.id}${bankRoutes.customer.overview}`}
            label={value}
          />
        ),
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
        calculateCellValue: (data: Companies) =>
          data.contract
            ? ProductTypeToLabel[data.contract.product_type as ProductTypeEnum]
            : "None",
      },
      {
        dataField: "contract_name",
        caption: "Contract Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.contract_name} />
        ),
      },
      {
        dataField: "dba_name",
        caption: "DBA",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.dba_name} />
        ),
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
        caption: "Total Outstanding Late Fees",
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
    ],
    [url]
  );

  return (
    <Page appBarTitle={"Customers"}>
      <PageContent title={"Customers"}>
        <Box
          display="flex"
          style={{ marginBottom: "1rem" }}
          justifyContent="space-between"
        >
          <Box display="flex">
            <TextField
              autoFocus
              label="Search"
              value={searchQuery}
              onChange={({ target: { value } }) => setSearchQuery(value)}
            />
          </Box>
          <Box display="flex" flexDirection="row-reverse">
            {check(role, Action.EditCustomerSettings) && (
              <Box>
                <ModalButton
                  dataCy={"create-customer-button"}
                  label={"Create Customer"}
                  color={"primary"}
                  modal={({ handleClose }) => (
                    <CreateCustomerModal
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            )}
            {check(role, Action.RunBalances) && (
              <Box mr={2}>
                <ModalButton
                  label={"Run Balances"}
                  color={"default"}
                  modal={({ handleClose }) => (
                    <RunCustomerBalancesModal
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            )}
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <ControlledDataGrid
            isExcelExport
            pager
            dataSource={customers}
            columns={columns}
          />
        </Box>
      </PageContent>
    </Page>
  );
}

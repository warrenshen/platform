import { Box, TextField } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CreateCustomerModal from "components/Customer/CreateCustomerModal";
import CreateBulkMinimumMonthlyFeeModal from "components/Fee/CreateMinimumInterestFeesModal";
import CreateMonthEndPaymentsModal from "components/Fee/CreateMonthEndPaymentsModal";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import KickoffMonthlySummaryEmailsModal from "components/Reports/KickoffMonthlySummaryEmailsModal";
import Can from "components/Shared/Can";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import PercentageDataGridCell from "components/Shared/DataGrid/PercentageDataGridCell";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  GetCustomersWithMetadataQuery,
  useGetCustomersWithMetadataQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { todayAsDateStringServer } from "lib/date";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { filter, sortBy } from "lodash";
import { useContext, useMemo, useState } from "react";

function getRows(
  customers: GetCustomersWithMetadataQuery["customers"]
): RowsProp {
  return customers.map((company) => ({
    ...company,
    company_url: getBankCompanyRoute(company.id, BankCompanyRouteEnum.Overview),
    cy_identifier: `customers-data-grid-view-customer-button-${company.identifier}`,
    product_type: company.contract
      ? ProductTypeToLabel[company.contract.product_type as ProductTypeEnum]
      : "None",
    adjusted_total_limit: !!company.financial_summaries
      ? company.financial_summaries[0]?.adjusted_total_limit
      : null,
    application_date: !!company.ebba_applications
      ? company.ebba_applications[0]?.application_date
      : null,
    total_outstanding_principal: !!company.financial_summaries
      ? company.financial_summaries[0]?.total_outstanding_principal
      : null,
    total_outstanding_interest: !!company.financial_summaries
      ? company.financial_summaries[0]?.total_outstanding_interest
      : null,
    total_outstanding_fees: !!company.financial_summaries
      ? company.financial_summaries[0]?.total_outstanding_fees
      : null,
    outstanding_account_fees: !!company.financial_summaries
      ? company.financial_summaries[company.financial_summaries.length - 1]
          ?.account_level_balance_payload?.fees_total
      : null,
    daily_interest_rate: !!company.contract
      ? company.contract.product_config.v1.fields.find(
          (field: any) => field.internal_name === "factoring_fee_percentage"
        )?.value * 100
      : 0,
  }));
}

export default function BankCustomersPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

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
        `${customer.name} ${customer.dba_name} ${customer.identifier}`
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return sortBy(filteredCustomers, (customer) => customer.name);
  }, [searchQuery, data?.customers]);

  const rows = customers ? getRows(customers) : [];

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            dataCy={data.cy_identifier}
            url={data.company_url}
            label={value}
          />
        ),
      },
      {
        fixed: true,
        dataField: "identifier",
        caption: "Identifier",
        minWidth: ColumnWidths.Identifier,
        width: ColumnWidths.Type,
      },
      {
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
        cellRender: (params: ValueFormatterParams) =>
          params.row.data.product_type,
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
        dataField: "adjusted_total_limit",
        caption: "Borrowing Limit",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.adjusted_total_limit} />
        ),
      },
      {
        dataField: "application_date",
        caption: "Most Recent Certification Date",
        minWidth: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.application_date} />
        ),
      },
      {
        dataField: "daily_interest_rate",
        caption: "Daily Interest Rate",
        minWidth: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <PercentageDataGridCell value={params.row.data.daily_interest_rate} />
        ),
      },
      {
        dataField: "total_outstanding_principal",
        caption: "Total Outstanding Principal",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_principal}
          />
        ),
      },
      {
        dataField: "total_outstanding_interest",
        caption: "Total Outstanding Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_interest}
          />
        ),
      },
      {
        dataField: "total_outstanding_fees",
        caption: "Total Outstanding Late Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.total_outstanding_fees}
          />
        ),
      },
      {
        dataField: "outstanding_account_fees",
        caption: "Outstanding Account Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.outstanding_account_fees || 0}
          />
        ),
      },
    ],
    []
  );

  return (
    <Page appBarTitle={"Customers"}>
      <PageContent
        title={"Customers"}
        bankActions={
          <>
            <Can perform={Action.KickoffMonthlySummaryEmails}>
              <Box mr={2}>
                <ModalButton
                  label={"Kickoff Monthly Summary Emails"}
                  color={"default"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <KickoffMonthlySummaryEmailsModal
                      handleClose={() => {
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            <Can perform={Action.BookFees}>
              <Box mr={2}>
                <ModalButton
                  label={"Create Month-End Repayments"}
                  color={"default"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <CreateMonthEndPaymentsModal
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            <Can perform={Action.BookFees}>
              <Box mr={2}>
                <ModalButton
                  label={"Book Minimum Interest Fees"}
                  color={"default"}
                  variant={"outlined"}
                  modal={({ handleClose }) => (
                    <CreateBulkMinimumMonthlyFeeModal
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            </Can>
            <Can perform={Action.RunBalances}>
              <Box mr={2}>
                <ModalButton
                  label={"Run Balances (All Customers)"}
                  color={"default"}
                  variant={"outlined"}
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
            </Can>
          </>
        }
      >
        <Box
          display="flex"
          style={{ marginBottom: "1rem" }}
          justifyContent="space-between"
        >
          <Box display="flex">
            <TextField
              autoFocus
              label="Search by customer identifier or name"
              value={searchQuery}
              onChange={({ target: { value } }) => setSearchQuery(value)}
              style={{ width: 300 }}
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
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <ControlledDataGrid
            isExcelExport
            pager
            dataSource={rows}
            columns={columns}
          />
        </Box>
      </PageContent>
    </Page>
  );
}

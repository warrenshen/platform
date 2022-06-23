import { Box, Checkbox, FormControlLabel, TextField } from "@material-ui/core";
import { RowsProp } from "@material-ui/data-grid";
import CreateCustomerModal from "components/Customer/CreateCustomerModal";
import UpdateCompanyDebtFacilityStatusModal from "components/DebtFacility/UpdateCompanyDebtFacilityStatusModal";
import CreateBulkMinimumMonthlyFeeModal from "components/Fee/CreateMinimumInterestFeesModal";
import CreateMonthEndPaymentsModal from "components/Fee/CreateMonthEndPaymentsModal";
import RunCustomerBalancesModal from "components/Loans/RunCustomerBalancesModal";
import KickoffMonthlySummaryEmailsModal from "components/Reports/KickoffMonthlySummaryEmailsModal";
import Can from "components/Shared/Can";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  CustomerForBankFragment,
  CustomersWithMetadataFragment,
  useGetActiveCustomersWithMetadataQuery,
  useGetCustomersWithMetadataQuery,
} from "generated/graphql";
import { useFilterCustomersByFragment } from "hooks/useFilterCustomers";
import { Action, check } from "lib/auth/rbac-rules";
import { todayAsDateStringServer } from "lib/date";
import {
  CustomerSurveillanceCategoryEnum,
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToLabel,
  ProductTypeEnum,
  ProductTypeToLabel,
} from "lib/enum";
import { PercentPrecision } from "lib/number";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { ChangeEvent, useContext, useMemo, useState } from "react";

function getBorrowingBaseDate(company: CustomersWithMetadataFragment) {
  const borrowingBaseDate = !!company?.ebba_applications
    ? company.ebba_applications.filter(
        ({ category }) =>
          category === CustomerSurveillanceCategoryEnum.BorrowingBase
      )[0]?.application_date
    : null;

  return !!borrowingBaseDate ? new Date(borrowingBaseDate) : null;
}

function getApplicationDate(company: CustomersWithMetadataFragment) {
  const applicationDate = !!company?.ebba_applications
    ? company.ebba_applications.filter(
        ({ category }) =>
          category === CustomerSurveillanceCategoryEnum.FinancialReport
      )[0]?.application_date
    : null;

  return !!applicationDate ? new Date(applicationDate) : null;
}

function getRows(customers: CustomersWithMetadataFragment[]): RowsProp {
  return customers.map((company) => {
    return formatRowModel({
      ...company,
      adjusted_total_limit: !!company?.financial_summaries?.[0]
        ? company.financial_summaries[0].adjusted_total_limit
        : null,
      application_date: getApplicationDate(company),
      borrowing_base_date: getBorrowingBaseDate(company),
      company_url: getBankCompanyRoute(
        company.id,
        BankCompanyRouteEnum.Overview
      ),
      cy_identifier: `customers-data-grid-view-customer-button-${company.identifier}`,
      daily_interest_rate: !!company?.financial_summaries?.[0]
        ?.daily_interest_rate
        ? company.financial_summaries[0].daily_interest_rate
        : null,
      debt_facility_status: !!company?.debt_facility_status
        ? DebtFacilityCompanyStatusToLabel[
            company.debt_facility_status as DebtFacilityCompanyStatusEnum
          ]
        : null,
      holding_account_balance:
        !!company?.financial_summaries[0]?.account_level_balance_payload.hasOwnProperty(
          "credits_total"
        )
          ? company.financial_summaries[0].account_level_balance_payload[
              "credits_total"
            ]
          : null,
      outstanding_account_fees:
        !!company?.financial_summaries?.[0]?.account_level_balance_payload.hasOwnProperty(
          "fees_total"
        )
          ? company.financial_summaries[0].account_level_balance_payload[
              "fees_total"
            ]
          : null,
      product_type: !!company?.financial_summaries?.[0]
        ? ProductTypeToLabel[
            company.financial_summaries[0].product_type as ProductTypeEnum
          ]
        : "None",
      total_outstanding_interest: !!company?.financial_summaries?.[0]
        ? company.financial_summaries[0].total_outstanding_interest
        : null,
      total_outstanding_fees: !!company?.financial_summaries?.[0]
        ? company.financial_summaries[0].total_outstanding_fees
        : null,
      total_outstanding_principal: !!company?.financial_summaries?.[0]
        ? company.financial_summaries[0].total_outstanding_principal
        : null,
    });
  });
}

export default function BankCustomersPage() {
  const [isActiveSelected, setIsActiveSelected] = useState(true);

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Companies["id"]>(
    []
  );

  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const {
    data: allData,
    refetch: refetchAllData,
    error: allError,
  } = useGetCustomersWithMetadataQuery({
    skip: !!isActiveSelected,
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (allError) {
    console.error({ allError });
    alert(`Error in query (details in console): ${allError.message}`);
  }

  const {
    data: activeData,
    refetch: refetchActiveData,
    error: allActiveError,
  } = useGetActiveCustomersWithMetadataQuery({
    skip: !isActiveSelected,
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (allActiveError) {
    console.error({ allActiveError });
    alert(`Error in query (details in console): ${allActiveError.message}`);
  }

  const data = useMemo(
    () =>
      !!isActiveSelected
        ? activeData?.customers || []
        : allData?.customers || [],
    [isActiveSelected, activeData, allData]
  );

  const [searchQuery, setSearchQuery] = useState("");

  const customers = useFilterCustomersByFragment(
    searchQuery,
    data
  ) as CustomersWithMetadataFragment[];

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
        dataField: "debt_facility_status",
        caption: "Debt Facility Status",
        width: ColumnWidths.ProductType,
      },
      {
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
      },
      {
        dataField: "contract_name",
        caption: "Contract Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "dba_name",
        caption: "DBA",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "adjusted_total_limit",
        format: "currency",
        caption: "Borrowing Limit",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "application_date",
        format: "shortDate",
        caption: "Most Recent Financial Report Date",
        minWidth: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "borrowing_base_date",
        format: "shortDate",
        caption: "Most Recent Borrowing Base Date",
        minWidth: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "daily_interest_rate",
        format: {
          type: "percent",
          precision: PercentPrecision,
        },
        caption: "Daily Interest Rate",
        minWidth: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_principal",
        format: "currency",
        caption: "Total Outstanding Principal",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_interest",
        format: "currency",
        caption: "Total Outstanding Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "total_outstanding_fees",
        format: "currency",
        caption: "Total Outstanding Late Fees",
        width: ColumnWidths.Currency,
      },
      {
        dataField: "outstanding_account_fees",
        format: "currency",
        caption: "Outstanding Account Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        dataField: "holding_account_balance",
        format: "currency",
        caption: "Holding Account Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    []
  );

  const handleSelectCompanies = useMemo(
    () => (companies: CustomerForBankFragment[]) => {
      setSelectedCompanyIds(companies.map((company) => company.id));
    },
    [setSelectedCompanyIds]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectCompanies &&
        handleSelectCompanies(selectedRowsData as CustomerForBankFragment[]),
    [handleSelectCompanies]
  );

  const selectedCompany = useMemo(
    () =>
      selectedCompanyIds.length === 1
        ? customers.find((company) => company.id === selectedCompanyIds[0])
        : null,
    [customers, selectedCompanyIds]
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
                        isActiveSelected
                          ? refetchAllData()
                          : refetchActiveData();
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
                        isActiveSelected
                          ? refetchAllData()
                          : refetchActiveData();
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
                        isActiveSelected
                          ? refetchAllData()
                          : refetchActiveData();
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
            <Box pt={1.5} ml={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={isActiveSelected}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setIsActiveSelected(event.target.checked)
                    }
                    color="primary"
                  />
                }
                label={"Is customer active?"}
              />
            </Box>
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
                        isActiveSelected
                          ? refetchAllData()
                          : refetchActiveData();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            )}
            {!!selectedCompany && (
              <Can perform={Action.UpdateCompanyDebtFacilityStatus}>
                <Box mr={2}>
                  <ModalButton
                    dataCy={"edit-company-debt-facility-status-button"}
                    label={"Edit Debt Facility Status"}
                    color={"primary"}
                    modal={({ handleClose }) => (
                      <UpdateCompanyDebtFacilityStatusModal
                        handleClose={() => {
                          isActiveSelected
                            ? refetchAllData()
                            : refetchActiveData();
                          handleClose();
                          setSelectedCompanyIds([]);
                        }}
                        selectedCompany={selectedCompany}
                      />
                    )}
                  />
                </Box>
              </Can>
            )}
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <ControlledDataGrid
            isExcelExport
            pager
            select
            dataSource={rows}
            columns={columns}
            selectedRowKeys={selectedCompanyIds}
            onSelectionChanged={handleSelectionChanged}
          />
        </Box>
      </PageContent>
    </Page>
  );
}

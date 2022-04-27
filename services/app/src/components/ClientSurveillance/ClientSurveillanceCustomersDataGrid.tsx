import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  Companies,
  GetCustomersWithMetadataAndLoansQuery,
  Loans,
} from "generated/graphql";
import {
  ClientSurveillanceCategoryEnum,
  LoanStatusEnum,
  ProductTypeEnum,
  ProductTypeToLabel,
  QualifyForEnum,
} from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import { getBankCompanyRoute, BankCompanyRouteEnum } from "lib/routes";
import { QualifyForToLabel } from "../../lib/enum";
import ClientSurveillanceStatusChip from "./ClientSurveillanceStatusChip";
import { Button } from "@material-ui/core";
import CommentIcon from "@material-ui/icons/Comment";
import { formatDatetimeString } from "lib/date";

interface Props {
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  customers: GetCustomersWithMetadataAndLoansQuery["customers"];
  selectedCompaniesIds?: Companies["id"][];
  handleSelectCompanies?: (companies: Companies[]) => void;
  handleClickCompanyBankStatusNote?: (id: Companies["id"]) => void;
}

const reduceLoanOutstandingPrincipalBalance = (
  acc: number,
  { outstanding_principal_balance, amount }: Loans
): number => acc + (outstanding_principal_balance || amount);

const filterByPastMaturityDate = ({ maturity_date }: Loans) => {
  const nowTime = new Date(Date.now()).getTime();

  return Math.floor((nowTime - maturity_date) / (24 * 60 * 60 * 1000)) > 0;
};

const filterByOpenedStatus = ({ status }: Loans) => {
  const openLoansStatuses = [
    LoanStatusEnum.Approved,
    LoanStatusEnum.Funded,
    LoanStatusEnum.PastDue,
  ];

  return openLoansStatuses.includes(status as LoanStatusEnum);
};

const calculatePercentageDelinquent = ({ loans }: Companies) => {
  const outstandingPrincipalForOpenLoans = loans
    .filter(filterByOpenedStatus)
    .reduce(reduceLoanOutstandingPrincipalBalance, 0);
  const outstandingPrincipalForPastDueLoans = loans
    .filter(filterByPastMaturityDate)
    .reduce(reduceLoanOutstandingPrincipalBalance, 0);

  return `${Math.ceil(
    (outstandingPrincipalForPastDueLoans / outstandingPrincipalForOpenLoans) *
      100
  )}%`;
};

function getRows(
  companies: GetCustomersWithMetadataAndLoansQuery["customers"]
): RowsProp {
  return companies.map((company) => ({
    ...company,
    company_url: getBankCompanyRoute(company.id, BankCompanyRouteEnum.Overview),
    application_date: !!company?.ebba_applications
      ? formatDatetimeString(
          company?.ebba_applications.filter(
            ({ category }) =>
              category === ClientSurveillanceCategoryEnum.FinancialReports
          )[0]?.application_date,
          false,
          "-"
        )
      : null,
    borrowing_base_date: !!company?.ebba_applications
      ? formatDatetimeString(
          company.ebba_applications.filter(
            ({ category }) =>
              category === ClientSurveillanceCategoryEnum.BorrowingBase
          )[0]?.application_date,
          false,
          "-"
        )
      : null,
    product_type:
      company?.financial_summaries && company.financial_summaries.length
        ? ProductTypeToLabel[
            company.financial_summaries[0].product_type as ProductTypeEnum
          ]
        : "None",
    debt_facility_status: company?.debt_facility_status
      ? company.debt_facility_status
      : null,
    percentage_delinquent:
      company?.loans && company?.loans.length
        ? calculatePercentageDelinquent(company as Companies)
        : null,
  }));
}

export default function ClientSurveillanceCustomersDataGrid({
  isExcelExport = true,
  isMultiSelectEnabled = false,
  customers,
  selectedCompaniesIds,
  handleSelectCompanies,
  handleClickCompanyBankStatusNote,
}: Props) {
  const rows = customers ? getRows(customers) : [];

  const columns = useMemo(
    () => [
      {
        dataField: "name",
        caption: "Customer Name",
        minWidth: ColumnWidths.Comment,
        alignment: "center",
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            dataCy={data.cy_identifier}
            url={data.company_url}
            label={value}
          />
        ),
      },
      {
        dataField: "product_type",
        caption: "Product",
        alignment: "center",
        width: ColumnWidths.Status,
      },
      {
        dataField: "bank_status",
        caption: "Client Surveillance Stage",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <ClientSurveillanceStatusChip
            requestStatus={params.row.data.bank_status}
          />
        ),
      },
      {
        dataField: "qualify_for",
        caption: "Qualifying for",
        width: ColumnWidths.Datetime,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell
            label={
              QualifyForToLabel[
                params.row.data.qualify_for as QualifyForEnum
              ] || "-"
            }
          />
        ),
      },
      {
        dataField: "application_date",
        caption: "Most Recent Financials",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.application_date} />
        ),
      },
      {
        dataField: "borrowing_base_date",
        caption: "Most Recent Borrowing Base",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.borrowing_base_date} />
        ),
      },
      {
        dataField: "percentage_delinquent",
        caption: "% Delinquent",
        width: ColumnWidths.MinWidth,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.percentage_delinquent} />
        ),
      },
      {
        dataField: "waiver_date",
        caption: "Waiver Date",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.waiver_date} />
        ),
      },
      {
        caption: "Bank Note",
        dataField: "bank_status_note",
        alignment: "center",
        width: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Button
            color="default"
            variant="text"
            style={{
              minWidth: 0,
              textAlign: "center",
            }}
            onClick={() =>
              !!handleClickCompanyBankStatusNote &&
              handleClickCompanyBankStatusNote(params.row.data.id)
            }
          >
            {!!params.row.data.bank_status_note ? <CommentIcon /> : "-"}
          </Button>
        ),
      },
    ],
    [handleClickCompanyBankStatusNote]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectCompanies && handleSelectCompanies(selectedRowsData),
    [handleSelectCompanies]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      select={isMultiSelectEnabled}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedCompaniesIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}

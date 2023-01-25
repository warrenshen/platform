import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { Companies, CustomersWithMetadataFragment } from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { Dispatch, SetStateAction, useMemo } from "react";

interface Props {
  isMultiSelectEnabled?: boolean;
  customers: CustomersWithMetadataFragment[];
  selectedCompanyIds: Companies["id"][];
  setSelectedCompanyIds: Dispatch<SetStateAction<Companies["id"][]>>;
  setSelectedCompanySettingsId: Dispatch<SetStateAction<Companies["id"][]>>;
}

function getRows(customers: CustomersWithMetadataFragment[]) {
  return customers.map((company) => {
    return formatRowModel({
      ...company,
      company_url: getBankCompanyRoute(
        company.id,
        BankCompanyRouteEnum.Overview
      ),
      cy_identifier: `customers-data-grid-view-customer-button-${company.identifier}`,
      interest_end_date: !!company?.settings?.interest_end_date
        ? parseDateStringServer(company.settings.interest_end_date)
        : null,
      late_fees_end_date: !!company?.settings?.late_fees_end_date
        ? parseDateStringServer(company.settings.late_fees_end_date)
        : null,
    });
  });
}

export default function BorrowersEndDatesDataGrid({
  isMultiSelectEnabled = true,
  customers,
  selectedCompanyIds,
  setSelectedCompanyIds,
  setSelectedCompanySettingsId,
}: Props) {
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
        dataField: "interest_end_date",
        format: "shortDate",
        caption: "Accounting Interest End Date",
        minWidth: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "late_fees_end_date",
        format: "shortDate",
        caption: "Accounting Late Fees End Date",
        minWidth: ColumnWidths.Date,
        alignment: "right",
      },
    ],
    []
  );

  const handleSelectCompanies = useMemo(
    () => (companies: CustomersWithMetadataFragment[]) => {
      setSelectedCompanyIds(companies.map((company) => company.id));
      setSelectedCompanySettingsId(
        companies.length === 1 && !!companies?.[0]?.settings?.id
          ? companies[0].settings.id
          : null
      );
    },
    [setSelectedCompanyIds, setSelectedCompanySettingsId]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectCompanies &&
        handleSelectCompanies(
          selectedRowsData as CustomersWithMetadataFragment[]
        ),
    [handleSelectCompanies]
  );

  return (
    <ControlledDataGrid
      isExcelExport
      pager
      select={isMultiSelectEnabled}
      filtering={{ enable: true }}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedCompanyIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}

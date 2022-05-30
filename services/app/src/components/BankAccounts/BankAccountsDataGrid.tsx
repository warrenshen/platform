import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { BankAccountFragment, BankAccounts } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

function getRows(bankAccounts: BankAccountFragment[]): RowsProp {
  return bankAccounts;
}

interface Props {
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  bankAccounts: BankAccountFragment[];
  selectedBankAccountIds?: BankAccounts["id"][];
  handleSelectBankAccounts?: (bankAccounts: BankAccountFragment[]) => void;
}

export default function BankAccountsDataGrid({
  isExcelExport = true,
  isMultiSelectEnabled = true,
  bankAccounts,
  selectedBankAccountIds,
  handleSelectBankAccounts,
}: Props) {
  const rows = getRows(bankAccounts);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "bank_name",
        caption: "Bank Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        fixed: true,
        caption: "Account Name",
        dataField: "account_title",
        width: ColumnWidths.MinWidth,
      },
      {
        caption: "Account Type",
        dataField: "account_type",
        width: ColumnWidths.MinWidth,
      },
      {
        caption: "Account Number",
        dataField: "account_number",
        width: ColumnWidths.MinWidth,
      },
      {
        caption: "ACH?",
        dataField: "can_ach",
        width: ColumnWidths.MinWidth,
      },
      {
        caption: "Wire?",
        dataField: "can_wire",
        width: ColumnWidths.MinWidth,
      },
      {
        visible: true,
        caption: "Is cannabis compliant?",
        dataField: "is_cannabis_compliant",
        width: ColumnWidths.MinWidth,
      },
      {
        caption: "Verified Date",
        dataField: "verified_date",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.verified_date} />
        ),
      },
    ],
    []
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectBankAccounts &&
        handleSelectBankAccounts(selectedRowsData as BankAccountFragment[]),
    [handleSelectBankAccounts]
  );

  return (
    <ControlledDataGrid
      pager
      select={isMultiSelectEnabled}
      isExcelExport={isExcelExport}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedBankAccountIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}

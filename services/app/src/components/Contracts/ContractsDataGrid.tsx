import { GridValueFormatterParams } from "@material-ui/data-grid";
import ContractDrawerLauncher from "components/Contract/ContractDrawerLauncher";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { ContractFragment, Contracts } from "generated/graphql";
import { formatDateString, parseDateStringServer } from "lib/date";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  isExcelExport?: boolean;
  isMultiSelectEnabled?: boolean;
  contracts: ContractFragment[];
  selectedContractIds: Contracts["id"][];
  handleSelectContracts: (contracts: ContractFragment[]) => void;
}

const getRows = (contracts: ContractFragment[]) =>
  contracts.map((contract) => ({
    ...contract,
    adjusted_end_date:
      !!contract.adjusted_end_date && !!contract.terminated_at
        ? parseDateStringServer(contract.adjusted_end_date)
        : "TBD",
    date_range: `${
      !!contract.start_date ? formatDateString(contract.start_date) : "-"
    } - ${
      !!contract.adjusted_end_date
        ? formatDateString(contract.adjusted_end_date)
        : "-"
    }`,
    end_date: !!contract.end_date
      ? parseDateStringServer(contract.end_date)
      : "-",
    product_type: ProductTypeToLabel[contract.product_type as ProductTypeEnum],
    start_date: !!contract.start_date
      ? parseDateStringServer(contract.start_date)
      : "-",
  }));

export default function ContractsDataGrid({
  isExcelExport = true,
  isMultiSelectEnabled = false,
  contracts,
  selectedContractIds,
  handleSelectContracts,
}: Props) {
  const rows = useMemo(() => getRows(contracts), [contracts]);
  const columns = useMemo(
    () => [
      {
        dataField: "date_range",
        caption: "Contract",
        width: ColumnWidths.DateContract,
        cellRender: (params: GridValueFormatterParams) => (
          <ContractDrawerLauncher
            label={params.row.data.date_range}
            contractId={params.row.data.id}
          />
        ),
      },
      {
        dataField: "product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
      },
      {
        dataField: "start_date",
        caption: "Contract Start Date",
        width: ColumnWidths.DateContract,
        alignment: "right",
        format: "shortDate",
      },
      {
        dataField: "end_date",
        caption: "Contract Expected End Date",
        width: ColumnWidths.DateContract,
        alignment: "right",
        format: "shortDate",
      },
      {
        dataField: "adjusted_end_date",
        caption: "Contract Termination Date",
        width: ColumnWidths.DateContract,
        alignment: "right",
        format: "shortDate",
      },
    ],
    []
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectContracts &&
        handleSelectContracts(selectedRowsData as ContractFragment[]),
    [handleSelectContracts]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      select={isMultiSelectEnabled}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedContractIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}

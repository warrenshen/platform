import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import { Companies, PaymentLimitedFragment, Payments } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

export enum RepaymentTypeEnum {
  Closed = "closed",
  RequestedReverseDraftACH = "requested-reverse-draft-ach",
  ReverseDraftACH = "reverse-draft-ach",
  Other = "other",
}

interface Props {
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  isMethodVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  repaymentType?: RepaymentTypeEnum;
  fees: PaymentLimitedFragment[];
  selectedPaymentIds?: Payments["id"][];
  onClickCustomerName?: (customerId: Companies["id"]) => void;
  handleSelectPayments?: (payments: PaymentLimitedFragment[]) => void;
}

export default function FeesDataGrid({
  isCompanyVisible = false,
  isExcelExport = false,
  isMultiSelectEnabled = false,
  fees,
  selectedPaymentIds,
  onClickCustomerName,
  handleSelectPayments,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = fees;
  const columns = useMemo(
    () => [
      {
        caption: "Submitted At",
        minWidth: ColumnWidths.MinWidth,
        alignment: "right",
        calculateCellValue: ({ submitted_at }: PaymentLimitedFragment) =>
          submitted_at,
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.submitted_at}
          />
        ),
      },
      {
        visible: isCompanyVisible,
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        calculateCellValue: ({ company }: any) => company?.name,
        cellRender: (params: ValueFormatterParams) =>
          onClickCustomerName ? (
            <ClickableDataGridCell
              label={params.row.data.company.name}
              onClick={() => {
                if (onClickCustomerName) {
                  onClickCustomerName(params.row.data.company.id);
                  dataGrid?.instance.filter([
                    "company.name",
                    "=",
                    params.row.data.company.name,
                  ]);
                }
              }}
            />
          ) : (
            params.row.data.company.name
          ),
      },
      {
        caption: "Fee Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.settlement_date} />
        ),
      },
      {
        dataField: "amount",
        caption: "Fee Amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        calculateCellValue: ({ amount }: PaymentLimitedFragment) => amount,
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
    ],
    [dataGrid?.instance, isCompanyVisible, onClickCustomerName]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectPayments &&
      handleSelectPayments(selectedRowsData as PaymentLimitedFragment[]),
    [handleSelectPayments]
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager
        select={isMultiSelectEnabled}
        isExcelExport={isExcelExport}
        dataSource={rows}
        columns={columns}
        ref={(ref) => setDataGrid(ref)}
        selectedRowKeys={selectedPaymentIds}
        onSelectionChanged={handleSelectionChanged}
      />
    </Box>
  );
}

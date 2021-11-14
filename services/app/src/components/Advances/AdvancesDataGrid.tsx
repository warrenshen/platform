import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  Companies,
  FinancialSummaries,
  PaymentFragment,
} from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

type PaymentWithFinancialSummary = PaymentFragment & {
  company: Pick<Companies, "id"> & {
    financial_summaries: Pick<FinancialSummaries, "id" | "product_type">[];
  };
};

function getRows(
  payments: (PaymentFragment | PaymentWithFinancialSummary)[]
): RowsProp {
  return payments.map((payment) => {
    return {
      ...payment,
      settlement_identifier: `${payment.company.identifier}-A${payment.settlement_identifier}`,
      product_type:
        ProductTypeToLabel[
          (payment as PaymentWithFinancialSummary).company?.financial_summaries
            ? ((payment as PaymentWithFinancialSummary).company
                ?.financial_summaries[0]?.product_type as ProductTypeEnum) ||
              ProductTypeEnum.None
            : ProductTypeEnum.None
        ],
    };
  });
}

interface Props {
  isExcelExport?: boolean;
  isProductTypeVisible?: boolean;
  payments: (PaymentFragment | PaymentWithFinancialSummary)[];
  handleClickCustomer: (value: string) => void;
}

export default function AdvancesDataGrid({
  isExcelExport = true,
  isProductTypeVisible = false,
  payments,
  handleClickCustomer,
}: Props) {
  const rows = getRows(payments);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        caption: "Disbursement Identifier",
        dataField: "settlement_identifier",
        width: 140,
      },
      {
        caption: "Customer Name",
        dataField: "company.name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            label={params.row.data.company.name}
            onClick={() => handleClickCustomer(params.row.data.company.name)}
          />
        ),
      },
      {
        visible: isProductTypeVisible,
        caption: "Product Type",
        dataField: "product_type",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Total Amount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        dataField: "method",
        caption: "Method",
        width: 90,
      },
      {
        caption: "Payment Date",
        dataField: "payment_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.payment_date} />
        ),
      },
      {
        caption: "Deposit Date",
        dataField: "deposit_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.deposit_date} />
        ),
      },
      {
        caption: "Settlement Date",
        dataField: "settlement_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.settlement_date} />
        ),
      },
      {
        dataField: "submitted_by_user.full_name",
        caption: "Submitted By",
        width: ColumnWidths.UserName,
      },
      {
        dataField: "settled_by_user.full_name",
        caption: "Settled By",
        width: ColumnWidths.UserName,
      },
    ],
    [isProductTypeVisible, handleClickCustomer]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      dataSource={rows}
      columns={columns}
    />
  );
}

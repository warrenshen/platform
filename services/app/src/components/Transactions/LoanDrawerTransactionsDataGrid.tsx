import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { TransactionExtendedFragment } from "generated/graphql";
import { formatDateString, formatDatetimeString } from "lib/date";
import { PaymentTypeEnum, PaymentTypeToLabel } from "lib/enum";
import { CurrencyPrecision } from "lib/number";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

interface Props {
  transactions: TransactionExtendedFragment[];
  isMiniTable?: Boolean;
  isExcelExport?: boolean;
}

const getRows = (transactions: TransactionExtendedFragment[]) => {
  const typeToPrefix: Record<string, string> = {
    [PaymentTypeEnum.Advance]: "A",
    [PaymentTypeEnum.Repayment]: "R",
    [PaymentTypeEnum.Fee]: "F",
    [PaymentTypeEnum.RepaymentOfAccountFee]: "RF",
    [PaymentTypeEnum.Adjustment]: "ADJ",
  };

  return transactions.map((transaction) => {
    const accountFees =
      !!transaction?.payment?.items_covered &&
      transaction.payment.items_covered.hasOwnProperty(
        "requested_to_account_fees"
      )
        ? transaction.payment.items_covered["requested_to_account_fees"]
        : null;
    const accountFeesDisplay =
      !!accountFees || accountFees === 0 ? accountFees : "-";

    const hasLoanIdentifierAttached = !!transaction?.loan?.identifier;
    const hasSettlementIdentifierAttached =
      !!transaction?.payment?.settlement_identifier;
    const hasTypeAttached = !!transaction?.type;
    let transactionNumber;
    if (
      hasTypeAttached &&
      hasLoanIdentifierAttached &&
      hasSettlementIdentifierAttached
    ) {
      transactionNumber = `${typeToPrefix[transaction.type]}-L${
        transaction?.loan?.identifier
      }-${transaction?.payment?.settlement_identifier}`;
    } else if (hasTypeAttached && hasSettlementIdentifierAttached) {
      transactionNumber = `${typeToPrefix[transaction.type]}-${
        transaction.payment.settlement_identifier
      }`;
    } else {
      transactionNumber = null;
    }

    return formatRowModel({
      ...transaction,
      company_name: !!transaction?.payment?.company?.name
        ? transaction.payment.company.name
        : null,
      company_url: !!transaction?.payment?.company?.id
        ? getBankCompanyRoute(
            transaction.payment.company.id,
            BankCompanyRouteEnum.Overview
          )
        : null,
      created_at: !!transaction?.created_at
        ? formatDatetimeString(transaction.created_at)
        : null,
      cy_identifier: !!transaction?.payment?.company?.name
        ? `${transaction.payment.company.name.replace("-", "")}-button`
        : "",
      effective_date: !!transaction?.effective_date
        ? formatDateString(transaction.effective_date)
        : null,
      to_account_fees: accountFees,
      to_account_fees_display: accountFeesDisplay,
      to_holding_account: 0, // to be completed when repayment flow has been refactored
      transaction_number: transactionNumber,
    });
  });
};

function TransactionsDataGrid({ transactions, isExcelExport = true }: Props) {
  const rows = useMemo(() => getRows(transactions), [transactions]);

  const columns = useMemo(
    () => [
      {
        caption: "Created At",
        dataField: "created_at",
        format: "longDateLongTime",
        width: ColumnWidths.Datetime,
        alignment: "left",
      },
      {
        caption: "Effective Date",
        dataField: "effective_date",
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        dataField: "type",
        caption: "Type",
        width: ColumnWidths.Identifier,
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(PaymentTypeEnum).map((paymentType) => ({
                type: paymentType,
                label: PaymentTypeToLabel[paymentType],
              })),
              key: "type",
            },
          },
          valueExpr: "type",
          displayExpr: "label",
        },
      },
      {
        caption: "Amount",
        dataField: "amount",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      pager
      dataSource={rows}
      filtering={{ enable: true }}
      columns={columns}
      isExcelExport={isExcelExport}
    />
  );
}

export default TransactionsDataGrid;

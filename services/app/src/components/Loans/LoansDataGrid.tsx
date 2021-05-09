import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import { FilterList } from "@material-ui/icons";
import InvoiceDrawerLauncher from "components/Invoices/InvoiceDrawerLauncher";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import PaymentStatusChip from "components/Shared/Chip/PaymentStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import {
  LoanArtifactLimitedFragment,
  LoanFragment,
  Loans,
  LoanStatusEnum,
  LoanTypeEnum,
  RequestStatusEnum,
} from "generated/graphql";
import { AllLoanStatuses, LoanTypeToLabel, PaymentStatusEnum } from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
} from "lib/loans";
import { ColumnWidths } from "lib/tables";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  isArtifactVisible?: boolean;
  isCompanyVisible?: boolean;
  isDisbursementIdentifierVisible?: boolean;
  isExcelExport?: boolean;
  isDaysPastDueVisible?: boolean;
  isFilteringEnabled?: boolean;
  isMaturityVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  isSortingDisabled?: boolean;
  isStatusVisible?: boolean;
  pager?: boolean;
  matureDays?: number;
  pageSize?: number;
  filterByStatus?: RequestStatusEnum;
  loans: (LoanFragment & LoanArtifactLimitedFragment)[];
  actionItems?: DataGridActionItem[];
  selectedLoanIds?: Loans["id"][];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function getRows(
  loans: (LoanFragment & LoanArtifactLimitedFragment)[]
): RowsProp {
  return loans.map((loan) => ({
    ...loan,
    customer_identifier: createLoanCustomerIdentifier(loan),
    disbursement_identifier: createLoanDisbursementIdentifier(loan),
    artifact_name: loan.purchase_order
      ? loan.purchase_order.order_number
      : loan.invoice
      ? loan.invoice.invoice_number
      : "N/A",
  }));
}

const getMaturityDate = (rowData: any) =>
  new Date(rowData.adjusted_maturity_date);

export default function LoansDataGrid({
  isArtifactVisible = false,
  isCompanyVisible = false,
  isDaysPastDueVisible = false,
  isDisbursementIdentifierVisible = false,
  isExcelExport = false,
  isFilteringEnabled = false,
  isMaturityVisible = false,
  isMultiSelectEnabled = false,
  isSortingDisabled = false,
  isStatusVisible = true,
  pager = true,
  matureDays = 0,
  pageSize = 10,
  filterByStatus,
  loans,
  actionItems,
  selectedLoanIds,
  handleSelectLoans,
}: Props) {
  const [dataGrid, setDataGrid] = useState<any>(null);
  const rows = useMemo(() => getRows(loans), [loans]);

  useEffect(() => {
    if (!dataGrid) {
      return;
    }

    dataGrid.instance.clearFilter(getMaturityDate);

    if (matureDays > 0)
      dataGrid.instance.filter([
        [getMaturityDate, ">", new Date(Date.now())],
        "and",
        [
          getMaturityDate,
          "<",
          new Date(
            new Date(Date.now()).getTime() + matureDays * 24 * 60 * 60 * 1000
          ),
        ],
      ]);

    if (filterByStatus) {
      dataGrid.instance.filter(["status", "=", filterByStatus]);
    }
  }, [isMaturityVisible, dataGrid, filterByStatus, matureDays]);

  const maturingInDaysRenderer = (value: any) => {
    const maturityTime = getMaturityDate(value.data).getTime();
    const nowTime = new Date(Date.now()).getTime();
    return Math.floor((maturityTime - nowTime) / (24 * 60 * 60 * 1000));
  };

  const daysPastDueRenderer = (value: any) => {
    const maturityTime = getMaturityDate(value.data).getTime();
    const nowTime = new Date(Date.now()).getTime();
    const daysPastDue = Math.floor(
      (nowTime - maturityTime) / (24 * 60 * 60 * 1000)
    );
    return daysPastDue > 0 ? daysPastDue.toString() : "-";
  };

  const columns = useMemo(
    () => [
      {
        fixed: true,
        visible: !!actionItems && actionItems.length > 0,
        dataField: "action",
        caption: "Action",
        alignment: "center",
        width: 80,
        cellRender: (params: ValueFormatterParams) => (
          <DataGridActionMenu params={params} actionItems={actionItems} />
        ),
      },
      {
        dataField: "customer_identifier",
        caption: "Customer Identifier",
        width: 120,
        cellRender: (params: ValueFormatterParams) => (
          <LoanDrawerLauncher
            label={params.row.data.customer_identifier}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        visible: isDisbursementIdentifierVisible,
        dataField: "disbursement_identifier",
        caption: "Disbursement Identifier",
        width: 120,
        cellRender: (params: ValueFormatterParams) => (
          <LoanDrawerLauncher
            label={params.row.data.disbursement_identifier}
            loanId={params.row.data.id as string}
          />
        ),
      },
      {
        visible: isStatusVisible && !isMaturityVisible,
        dataField: "status",
        caption: "Approval Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <LoanStatusChip loanStatus={params.value as LoanStatusEnum} />
        ),
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: AllLoanStatuses.map((d) => ({
                status: d,
              })),
              key: "status",
            },
          },
          valueExpr: "status",
          displayExpr: "status",
        },
      },
      {
        visible: isStatusVisible && isMaturityVisible,
        dataField: "payment_status",
        caption: "Payment Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <PaymentStatusChip
            paymentStatus={params.row.data.payment_status as PaymentStatusEnum}
          />
        ),
      },
      {
        visible: isCompanyVisible,
        caption: "Loan Type",
        dataField: "loan_type",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <Box>
            {LoanTypeToLabel[params.row.data.loan_type as LoanTypeEnum]}
          </Box>
        ),
      },
      {
        visible: isCompanyVisible,
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Box display="flex" alignItems="center">
            <Link to={`/customers/${params.row.data.company.id}/loans`}>
              <Box display="flex" alignItems="center" mr={1}>
                <FilterList />
              </Box>
            </Link>
            <Box>{params.row.data.company.name as string}</Box>
          </Box>
        ),
      },
      {
        visible: isArtifactVisible,
        dataField: "artifact_name",
        caption: "Purchase Order / Invoice",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <Box display="flex" alignItems="center">
            {params.row.data.purchase_order && (
              <PurchaseOrderDrawerLauncher
                label={params.row.data.artifact_name as string}
                purchaseOrderId={params.row.data.purchase_order.id as string}
              />
            )}
            {params.row.data.invoice && (
              <InvoiceDrawerLauncher
                label={params.row.data.artifact_name as string}
                invoiceId={params.row.data.invoice.id as string}
              />
            )}
            {params.row.data.line_of_credit && "N/A"}
          </Box>
        ),
      },
      {
        caption: "Loan Amount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount} />
        ),
      },
      {
        visible: !isMaturityVisible,
        caption: "Requested Payment Date",
        dataField: "requested_payment_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.requested_payment_date}
          />
        ),
      },
      {
        visible: isMaturityVisible,
        caption: "Origination Date",
        dataField: "origination_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.origination_date} />
        ),
      },
      {
        visible: isMaturityVisible,
        caption: "Maturity Date",
        dataField: "adjusted_maturity_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell
            dateString={params.row.data.adjusted_maturity_date}
          />
        ),
      },
      {
        visible: !isDaysPastDueVisible && isMaturityVisible,
        caption: "Maturing in (Days)",
        width: 100,
        alignment: "right",
        calculateCellValue: (row: any) => maturingInDaysRenderer({ data: row }),
      },
      {
        visible: isDaysPastDueVisible,
        caption: "Days Past Due",
        width: 100,
        alignment: "right",
        calculateCellValue: (row: any) => daysPastDueRenderer({ data: row }),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_principal_balance",
        caption: "Outstanding Principal",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.outstanding_principal_balance}
          />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_interest",
        caption: "Outstanding Interest",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_interest} />
        ),
      },
      {
        visible: isMaturityVisible,
        dataField: "outstanding_fees",
        caption: "Oustanding Fees",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.outstanding_fees} />
        ),
      },
    ],
    [
      isArtifactVisible,
      isCompanyVisible,
      isDaysPastDueVisible,
      isDisbursementIdentifierVisible,
      isMaturityVisible,
      isStatusVisible,
      actionItems,
    ]
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectLoans &&
      handleSelectLoans(selectedRowsData as LoanFragment[]),
    [handleSelectLoans]
  );

  const allowedPageSizes = useMemo(() => [], []);
  const filtering = useMemo(() => ({ enable: isFilteringEnabled }), [
    isFilteringEnabled,
  ]);

  return (
    <ControlledDataGrid
      ref={(ref) => setDataGrid(ref)}
      isExcelExport={isExcelExport}
      isSortingDisabled={isSortingDisabled}
      filtering={filtering}
      pager={pager}
      select={isMultiSelectEnabled}
      pageSize={pageSize}
      allowedPageSizes={allowedPageSizes}
      dataSource={rows}
      columns={columns}
      selectedRowKeys={selectedLoanIds}
      onSelectionChanged={handleSelectionChanged}
    />
  );
}

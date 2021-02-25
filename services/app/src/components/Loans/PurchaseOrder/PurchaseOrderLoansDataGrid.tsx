import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import PurchaseOrderDrawerLauncher from "components/PurchaseOrder/PurchaseOrderDrawerLauncher";
import IsFundedChip from "components/Shared/Chip/IsFundedChip";
import PaymentStatusChip from "components/Shared/Chip/PaymentStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { LoanFragment, Loans } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { PaymentStatusEnum } from "lib/enum";
import { createLoanPublicIdentifier } from "lib/loans";
import React, { useContext } from "react";

interface Props {
  pager?: boolean;
  isMaturityVisible?: boolean; // Whether maturity date, principal balance, interest, and fees are visible.
  isMiniTable?: boolean;
  loans: LoanFragment[];
  selectedLoanIds?: Loans["id"][];
  actionItems?: DataGridActionItem[];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function PurchaseOrderLoansDataGrid({
  pager = true,
  isMaturityVisible = true,
  isMiniTable = false,
  loans,
  selectedLoanIds = [],
  actionItems = [],
  handleSelectLoans = () => {},
}: Props) {
  const { user } = useContext(CurrentUserContext);

  const rows = loans;

  const columns = [
    {
      dataField: "id",
      caption: "Identifier",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <LoanDrawerLauncher
          label={createLoanPublicIdentifier(params.row.data as LoanFragment)}
          loanId={params.row.data.id as string}
        />
      ),
    },
    {
      visible: !isMiniTable && actionItems.length > 0,
      dataField: "action",
      caption: "Action",
      alignment: "center",
      minWidth: 100,
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu params={params} actionItems={actionItems} />
      ),
    },
    {
      dataField: "funded_at",
      caption: "Status",
      alignment: "center",
      minWidth: 100,
      cellRender: (params: ValueFormatterParams) => (
        <IsFundedChip fundedAt={params.value as string} />
      ),
    },
    {
      visible: isMaturityVisible,
      dataField: "payment_status",
      caption: "Payment Status",
      alignment: "right",
      width: 140,
      cellRender: (params: ValueFormatterParams) => (
        <PaymentStatusChip paymentStatus={params.value as PaymentStatusEnum} />
      ),
    },
    {
      visible: !isMiniTable,
      dataField: "artifact_id",
      caption: "Purchase Order",
      width: 160,
      cellRender: (params: ValueFormatterParams) => (
        <PurchaseOrderDrawerLauncher
          label={params.row.data.purchase_order?.order_number as string}
          purchaseOrderId={params.row.data.purchase_order?.id as string}
        />
      ),
    },
    {
      alignment: "right",
      caption: "Amount",
      minWidth: 150,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.amount} />
      ),
    },
    {
      visible: !isMiniTable && !isMaturityVisible,
      caption: "Requested Payment Date",
      alignment: "right",
      minWidth: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.requested_payment_date} />
      ),
    },
    {
      visible: !isMiniTable && check(user.role, Action.ViewLoanInternalNote),
      dataField: "notes",
      caption: "Internal Note",
      minWidth: 300,
    },
    {
      visible: isMaturityVisible,
      caption: "Origination Date",
      alignment: "right",
      minWidth: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.origination_date} />
      ),
    },
    {
      visible: isMaturityVisible,
      caption: "Maturity Date",
      alignment: "right",
      minWidth: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.maturity_date} />
      ),
    },
    {
      visible: isMaturityVisible,
      dataField: "outstanding_principal_balance",
      caption: "Outstanding Principal Balance",
      alignment: "right",
      width: 160,
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
      alignment: "right",
      width: 160,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.outstanding_interest} />
      ),
    },
    {
      visible: isMaturityVisible,
      dataField: "outstanding_fees",
      caption: "Outstanding Fees",
      alignment: "right",
      width: 160,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell value={params.row.data.outstanding_fees} />
      ),
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager={pager}
        pageSize={isMiniTable ? 10 : 10}
        select={!isMiniTable}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedLoanIds}
        onSelectionChanged={({ selectedRowsData }: any) =>
          handleSelectLoans(selectedRowsData as LoanFragment[])
        }
      />
    </Box>
  );
}

export default PurchaseOrderLoansDataGrid;

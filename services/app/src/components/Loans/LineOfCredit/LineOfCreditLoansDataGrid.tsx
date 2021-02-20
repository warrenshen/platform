import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { LoanFragment, Loans, LoanStatusEnum } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { createLoanPublicIdentifier } from "lib/loans";
import React, { useContext } from "react";

interface Props {
  isMaturityVisible?: boolean; // Whether maturity date, principal balance, interest, and fees are visible.
  loans: LoanFragment[];
  selectedLoanIds?: Loans["id"][];
  actionItems?: DataGridActionItem[];
  handleSelectLoans?: (loans: LoanFragment[]) => void;
}

function LineOfCreditLoansDataGrid({
  isMaturityVisible = true,
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
      dataField: "action",
      caption: "Action",
      alignment: "center",
      minWidth: 100,
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu params={params} actionItems={actionItems} />
      ),
    },
    {
      dataField: "status",
      caption: "Status",
      alignment: "center",
      minWidth: 175,
      cellRender: (params: ValueFormatterParams) => (
        <LoanStatusChip loanStatus={params.value as LoanStatusEnum} />
      ),
    },
    {
      caption: "Credit For Vendor?",
      minWidth: 150,
      cellRender: (params: ValueFormatterParams) => (
        <Box>
          {params.row.data.line_of_credit?.is_credit_for_vendor ? "Yes" : "No"}
        </Box>
      ),
    },
    {
      caption: "Recipient Vendor",
      minWidth: 150,
      cellRender: (params: ValueFormatterParams) => (
        <Box>
          {params.row.data.line_of_credit.is_credit_for_vendor
            ? params.row.data.line_of_credit.recipient_vendor.name
            : "N/A"}
        </Box>
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
      visible: !isMaturityVisible,
      caption: "Requested Payment Date",
      alignment: "right",
      minWidth: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell dateString={params.row.data.requested_payment_date} />
      ),
    },
    {
      visible: check(user.role, Action.ViewLoanInternalNote),
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
        pager
        select
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

export default LineOfCreditLoansDataGrid;

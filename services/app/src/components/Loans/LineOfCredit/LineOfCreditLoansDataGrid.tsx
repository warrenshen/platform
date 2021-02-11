import { Box } from "@material-ui/core";
import { CellParams, ValueFormatterParams } from "@material-ui/data-grid";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DataGridActionMenu, {
  DataGridActionItem,
} from "components/Shared/DataGrid/DataGridActionMenu";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import LoanDrawerLauncher from "components/Shared/Loan/LoanDrawerLauncher";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  LineOfCreditFragment,
  LoanFragment,
  RequestStatusEnum,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { truncateUuid } from "lib/uuid";
import React, { useContext } from "react";

interface Props {
  loans: LoanFragment[];
  actionItems: DataGridActionItem[];
}

function LineOfCreditLoansDataGrid({ loans, actionItems }: Props) {
  const { user } = useContext(CurrentUserContext);

  const rows = loans;

  const renderLineOfCredit = (params: CellParams) => {
    const loan = params.row.data;
    // const loanId = loan.id as string;
    const lineOfCredit = loan.line_of_credit as LineOfCreditFragment;
    return (
      <Box>
        <span>{lineOfCredit?.is_credit_for_vendor ? "Yes" : "No"}</span>
        {/* <Launcher purchaseOrderLoanId={purchaseOrderLoanId}></Launcher> */}
      </Box>
    );
  };

  const columns = [
    {
      dataField: "id",
      caption: "Platform ID",
      width: 120,
      cellRender: (params: ValueFormatterParams) => (
        <LoanDrawerLauncher
          label={truncateUuid(params.row.data.id as string)}
          loanId={params.row.data.id as string}
        ></LoanDrawerLauncher>
      ),
    },
    {
      caption: "Credit For Vendor?",
      minWidth: 150,
      cellRender: renderLineOfCredit,
    },
    {
      caption: "Recipient Vendor",
      minWidth: 150,
      cellRender: () => "",
    },
    {
      alignment: "right",
      caption: "Amount",
      minWidth: 150,
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.amount}
        ></CurrencyDataGridCell>
      ),
    },
    {
      caption: "Payment Date",
      alignment: "right",
      minWidth: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell
          dateString={params.row.data.origination_date}
        ></DateDataGridCell>
      ),
    },
    {
      caption: "Maturity Date",
      alignment: "right",
      minWidth: 140,
      cellRender: (params: ValueFormatterParams) => (
        <DateDataGridCell
          dateString={params.row.data.maturity_date}
        ></DateDataGridCell>
      ),
    },
    {
      caption: "Outstanding Principal Balance",
      minWidth: 220,
      alignment: "right",
      cellRender: (params: ValueFormatterParams) => (
        <CurrencyDataGridCell
          value={params.row.data.outstanding_principal_balance}
        ></CurrencyDataGridCell>
      ),
    },
    {
      dataField: "status",
      caption: "Status",
      alignment: "center",
      minWidth: 175,
      cellRender: (params: ValueFormatterParams) => (
        <RequestStatusChip
          requestStatus={params.value as RequestStatusEnum}
        ></RequestStatusChip>
      ),
    },
    {
      dataField: "action",
      caption: "Action",
      alignment: "center",
      minWidth: 100,
      visible: check(user.role, Action.ViewPurchaseOrdersActionMenu),
      cellRender: (params: ValueFormatterParams) => (
        <DataGridActionMenu
          params={params}
          actionItems={actionItems}
        ></DataGridActionMenu>
      ),
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid dataSource={rows} columns={columns} select pager />
    </Box>
  );
}

export default LineOfCreditLoansDataGrid;

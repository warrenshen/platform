import { Box } from "@material-ui/core";
import { CellParams, ValueFormatterParams } from "@material-ui/data-grid";
import Status from "components/Shared/Chip/Status";
import ActionMenu from "components/Shared/DataGrid/ActionMenu";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
  Selection,
} from "devextreme-react/data-grid";
import { LineOfCreditFragment, LoanFragment } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import React, { useContext } from "react";

interface DataGridActionItem {
  key: string;
  label: string;
  handleClick: (params: ValueFormatterParams) => void;
}

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

  const renderStatusCell = (params: ValueFormatterParams) => (
    <Status statusValue={params.value} />
  );

  const renderActionCell = (params: ValueFormatterParams) => (
    <ActionMenu
      actionItems={actionItems.map((actionItem) => ({
        ...actionItem,
        handleClick: () => actionItem.handleClick(params),
      }))}
    ></ActionMenu>
  );

  const columns: IColumnProps[] = [
    {
      caption: "Is For Vendor?",
      minWidth: 150,
      cellRender: renderLineOfCredit,
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
      cellRender: renderStatusCell,
    },
    {
      dataField: "action",
      caption: "Action",
      alignment: "center",
      minWidth: 100,
      visible: check(user.role, Action.ViewPurchaseOrdersActionMenu),
      cellRender: renderActionCell,
    },
  ];

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <DataGrid height={"100%"} wordWrapEnabled={true} dataSource={rows}>
        {columns.map(
          ({
            dataField,
            minWidth,
            alignment,
            visible,
            caption,
            cellRender,
          }) => (
            <Column
              key={caption}
              caption={caption}
              visible={visible}
              dataField={dataField}
              minWidth={minWidth}
              alignment={alignment}
              cellRender={cellRender}
            />
          )
        )}
        <Selection
          mode="multiple"
          selectAllMode={"allPages"}
          showCheckBoxesMode={"always"}
        />
        <Paging defaultPageSize={50} />
        <Pager
          visible={true}
          showPageSizeSelector={true}
          allowedPageSizes={[10, 20, 50]}
          showInfo={true}
        />
      </DataGrid>
    </Box>
  );
}

export default LineOfCreditLoansDataGrid;

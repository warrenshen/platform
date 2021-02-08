import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import Status from "components/Shared/Chip/Status";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
  Selection,
} from "devextreme-react/data-grid";
import { LineOfCreditFragment, LoanFragment } from "generated/graphql";
import React from "react";

interface Props {
  loans: LoanFragment[];
}

function LineOfCreditLoansDataGrid({ loans }: Props) {
  const rows = loans;

  const renderLineOfCredit = (params: ValueFormatterParams) => {
    const loan = params.row.data;
    // const loanId = loan.id as string;
    const lineOfCredit = loan.line_of_credit as LineOfCreditFragment;
    return (
      <Box>
        <span>{lineOfCredit?.is_credit_for_vendor}</span>
        {/* <Launcher purchaseOrderLoanId={purchaseOrderLoanId}></Launcher> */}
      </Box>
    );
  };

  const renderStatusCell = (params: ValueFormatterParams) => (
    <Status statusValue={params.value} />
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

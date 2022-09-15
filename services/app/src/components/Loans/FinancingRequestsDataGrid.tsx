import { RowsProp } from "@material-ui/data-grid";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { LoanLimitedFragment } from "generated/graphql";
import { parseDateStringServer } from "lib/date";
import { LoanStatusEnum } from "lib/enum";
import { createLoanCustomerIdentifier } from "lib/loans";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

interface Props {
  financingRequests: LoanLimitedFragment[];
  isMultiSelectEnabled?: boolean;
}

function getRows(financingRequests: LoanLimitedFragment[]): RowsProp {
  return financingRequests.map((financingRequest) => {
    return formatRowModel({
      ...financingRequest,
      customer_identifier: createLoanCustomerIdentifier(financingRequest),
      requested_payment_date: parseDateStringServer(
        financingRequest.requested_payment_date
      ),
    });
  });
}

const FinancialRequestsDataGrid = ({
  financingRequests,
  isMultiSelectEnabled = false,
}: Props) => {
  const rows = getRows(financingRequests);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        caption: "Customer Identifier",
        dataField: "customer_identifier",
        maxWidth: ColumnWidths.Identifier,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <LoanDrawerLauncher label={value} loanId={data.id} />
        ),
      },
      {
        caption: "Approval Status",
        dataField: "status",
        width: ColumnWidths.Status,
        cellRender: ({ value }: { value: string }) => (
          <LoanStatusChip loanStatus={value as LoanStatusEnum} />
        ),
      },
      {
        caption: "Loan Amount",
        dataField: "amount",
        minWidth: ColumnWidths.Currency,
        width: ColumnWidths.Type,
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
      },
      {
        caption: "Requested Payment Date",
        dataField: "requested_payment_date",
        width: ColumnWidths.Date,
        alignment: "right",
        format: "shortDate",
      },
      {
        caption: "Comments",
        dataField: "customer_notes",
        width: 340,
        alignment: "right",
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      dataSource={rows}
      columns={columns}
      select={isMultiSelectEnabled}
    />
  );
};

export default FinancialRequestsDataGrid;

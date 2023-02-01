import { Box } from "@material-ui/core";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { ArrowRightIcon } from "icons";
import { LoanBeforeAfterPayment } from "lib/finance/payments/repayment";
import { useMemo } from "react";

const columns = [
  {
    dataField: "outstanding_principal_balance",
    caption: "Principal",
    width: 100,
  },
  {
    dataField: "outstanding_interest",
    caption: "Interest",
    width: 100,
  },
  {
    dataField: "outstanding_fees",
    caption: "Late Fees",
    width: 100,
  },
];

const loanIdentifierColumns = [
  {
    dataField: "loan_identifier",
    width: 100,
  },
];

const getRows = (
  loansBeforeAfterPayment: LoanBeforeAfterPayment[],
  before: boolean
) => {
  return loansBeforeAfterPayment.map((loan) => {
    const { loan_id } = loan;
    const {
      outstanding_principal_balance,
      outstanding_interest,
      outstanding_fees,
    } = before ? loan.loan_balance_before : loan.loan_balance_after;
    return {
      id: loan_id,
      outstanding_principal_balance,
      outstanding_interest,
      outstanding_fees,
    };
  });
};

interface Props {
  isSettlePayment: boolean;
  loansBeforeAfterPayment: LoanBeforeAfterPayment[];
}

const LoansBeforeAfterPaymentPreviewNew = ({
  // requried for the "Settle Payment" flow
  isSettlePayment,
  loansBeforeAfterPayment,
}: Props) => {
  const rowsBefore = useMemo(
    () => getRows(loansBeforeAfterPayment, true),
    [loansBeforeAfterPayment]
  );
  const rowsAfter = useMemo(
    () => getRows(loansBeforeAfterPayment, false),
    [loansBeforeAfterPayment]
  );

  rowsBefore.push(
    rowsBefore.reduce(
      (acc, row) => {
        return {
          id: "Total",
          outstanding_principal_balance:
            acc.outstanding_principal_balance +
            row.outstanding_principal_balance,
          outstanding_interest:
            acc.outstanding_interest + row.outstanding_interest,
          outstanding_fees: acc.outstanding_fees + row.outstanding_fees,
        };
      },
      {
        id: "Total",
        outstanding_principal_balance: 0,
        outstanding_interest: 0,
        outstanding_fees: 0,
      }
    )
  );
  rowsAfter.push(
    rowsAfter.reduce(
      (acc, row) => {
        return {
          id: "Total",
          outstanding_principal_balance:
            acc.outstanding_principal_balance +
            row.outstanding_principal_balance,
          outstanding_interest:
            acc.outstanding_interest + row.outstanding_interest,
          outstanding_fees: acc.outstanding_fees + row.outstanding_fees,
        };
      },
      {
        id: "Total",
        outstanding_principal_balance: 0,
        outstanding_interest: 0,
        outstanding_fees: 0,
      }
    )
  );

  return (
    <Box display="flex" justifyContent="space-between">
      <Box mt={7.5}>
        <ControlledDataGrid
          isExcelExport={false}
          dataSource={[
            ...loansBeforeAfterPayment.map((loan) => ({
              id: loan.loan_id,
              loan_identifier: loan.loan_identifier,
            })),
            { id: "Total", loan_identifier: "Total" },
          ]}
          columns={loanIdentifierColumns}
          showColumnHeaders={false}
        />
      </Box>
      <Box>
        <ControlledDataGrid
          isExcelExport={false}
          dataSource={rowsBefore}
          columns={columns}
        />
      </Box>
      <Box mt={10}>
        <ArrowRightIcon />
      </Box>
      <Box>
        <ControlledDataGrid
          isExcelExport={false}
          dataSource={rowsAfter}
          columns={columns}
        />
      </Box>
    </Box>
  );
};

export default LoansBeforeAfterPaymentPreviewNew;

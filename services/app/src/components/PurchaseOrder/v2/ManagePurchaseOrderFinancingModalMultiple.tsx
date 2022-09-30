import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Typography,
} from "@material-ui/core";
import { RowsProp } from "@material-ui/data-grid";
import { Alert } from "@material-ui/lab";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import ClickableDataGridCell from "components/Shared/DataGrid/v2/ClickableDataGridCell";
import DateInput from "components/Shared/FormInputs/DateInput";
import Modal from "components/Shared/Modal/Modal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  GetPurchaseOrdersForIdsQuery,
  LoanFragment,
  LoanTypeEnum,
  Loans,
  PurchaseOrders,
  useGetCustomerOverviewQuery,
  useGetPurchaseOrdersForIdsLimitedQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { DateInputIcon } from "icons";
import { getCompanyDisplayName } from "lib/companies";
import { parseDateStringServer } from "lib/date";
import { LoanStatusEnum, ProductTypeEnum } from "lib/enum";
import {
  PurchaseOrderLoanUpsert,
  upsertPurchaseOrdersLoansMutation,
} from "lib/finance/loans/purchaseOrders";
import { CurrencyPrecision } from "lib/number";
import { computePurchaseOrderDueDateDateStringClientNew } from "lib/purchaseOrders";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useContext, useMemo, useState } from "react";
import styled from "styled-components";

import PurchaseOrderDrawer from "../PurchaseOrderDrawer";

export const DateInputContainer = styled(FormControl)`
  background-color: #f6f5f3;
  padding: 24px 32px 32px 32px;
`;

const sumPossibleLoans = (computedLoans: PurchaseOrderLoanUpsert[]) =>
  computedLoans.reduce((sum: number, l: any) => (sum += l.loan.amount), 0);

const grabCustomerBalanceRemaining = (data: any) =>
  data.companies_by_pk.financial_summaries[0]?.available_limit;

const decorateLoansWithPaymentDate = (
  loans: PurchaseOrderLoanUpsert[],
  paymentDate: string
) =>
  loans.map((l) => ({
    ...l,
    loan: { ...l.loan, requested_payment_date: paymentDate },
  }));

function getRows(computedPurchaseOrderLoans: any[]): RowsProp {
  return computedPurchaseOrderLoans.map((computedPurchaseOrderLoan) => {
    const purchaseOrder = computedPurchaseOrderLoan.artifact;
    return formatRowModel({
      ...purchaseOrder,
      company_name: purchaseOrder.company.name,
      due_date: computePurchaseOrderDueDateDateStringClientNew(purchaseOrder),
      order_date: !!purchaseOrder.order_date
        ? parseDateStringServer(purchaseOrder.order_date)
        : null,
      vendor_name: getCompanyDisplayName(purchaseOrder.vendor),
    });
  });
}

interface Props {
  companyId: Companies["id"];
  purchaseOrderIds: PurchaseOrders["id"][];
  handleClose: () => void;
}

function ManagePurchaseOrderFinancingModalMultiple({
  companyId,
  purchaseOrderIds,
  handleClose,
}: Props) {
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(null);
  const columns = useMemo(
    () => [
      {
        caption: "PO Number",
        dataField: "order_number",
        minWidth: ColumnWidths.Type,
        cellRender: ({ value, data }: { value: string; data: any }) => {
          return (
            <ClickableDataGridCell
              label={value}
              onClick={() => setSelectedPurchaseOrderId(data.id)}
            />
          );
        },
      },
      {
        caption: "Vendor",
        dataField: "vendor_name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        caption: "Total Aamount",
        dataField: "amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
      },
      {
        caption: "PO Date",
        dataField: "order_date",
        width: ColumnWidths.Date,
        alignment: "center",
        format: "shortDate",
      },
      {
        caption: "Due Date",
        dataField: "due_date",
        width: ColumnWidths.Date,
        alignment: "center",
        format: "shortDate",
      },
    ],
    []
  );

  const snackbar = useSnackbar();

  const {
    user: { productType },
  } = useContext(CurrentUserContext);

  const { data: customerData } = useGetCustomerOverviewQuery({
    variables: {
      company_id: companyId,
      loan_type:
        productType === ProductTypeEnum.LineOfCredit
          ? LoanTypeEnum.LineOfCredit
          : LoanTypeEnum.PurchaseOrder,
    },
  });

  const { data: purchaseOrdersData, loading } =
    useGetPurchaseOrdersForIdsLimitedQuery({
      variables: {
        purchaseOrderIds: purchaseOrderIds,
      },
    });

  const [upsertPurchaseOrdersLoans] = useCustomMutation(
    upsertPurchaseOrdersLoansMutation
  );

  const [paymentDate, setPaymentDate] = useState<string | null>(null);

  if (!customerData || loading) {
    return null; // Early Return and wait for the purchase order to show up
  }

  const sumAmountForLoans = (loans: Array<Pick<Loans, "id"> & LoanFragment>) =>
    loans.reduce((sum, l) => (sum += l.amount), 0);

  const computeLoans = (
    purchaseOrders: GetPurchaseOrdersForIdsQuery["purchase_orders"]
  ) =>
    purchaseOrders
      .filter((po: any) => !po.funded_at)
      .map(
        (po: any) =>
          ({
            loan: {
              id: null,
              amount:
                po.amount -
                sumAmountForLoans(
                  po.loans.filter(
                    (loan: any) => loan.status !== LoanStatusEnum.Drafted
                  )
                ),
              artifact_id: po.id,
              requested_payment_date: null,
            },
            artifact: po,
          } as PurchaseOrderLoanUpsert)
      )
      .filter((po: PurchaseOrderLoanUpsert) => po.loan.amount > 0);

  const computedPurchaseOrderLoans = computeLoans(
    purchaseOrdersData?.purchase_orders || []
  );
  const rows = getRows(computedPurchaseOrderLoans);

  const handleClickSubmit = async () => {
    if (paymentDate) {
      const purchaseOrderLoanUpserts = decorateLoansWithPaymentDate(
        computedPurchaseOrderLoans,
        paymentDate
      );
      const response = await upsertPurchaseOrdersLoans({
        variables: {
          company_id: companyId,
          status: LoanStatusEnum.ApprovalRequested,
          data: purchaseOrderLoanUpserts,
        },
      });

      if (response.status === "ERROR") {
        snackbar.showError(response.msg);
      } else {
        snackbar.showSuccess(
          `Your ${
            purchaseOrderLoanUpserts.length > 1
              ? purchaseOrderLoanUpserts.length + "loans were"
              : "loan was"
          } saved and submitted to Bespoke for approval`
        );
        handleClose();
      }
    } else {
      snackbar.showError("Requested Payment Date not set");
    }
  };

  const customerBalanceRemainingNow =
    grabCustomerBalanceRemaining(customerData);
  const errBalanceExceeded =
    customerBalanceRemainingNow - sumPossibleLoans(computedPurchaseOrderLoans) <
    0;

  return errBalanceExceeded ? (
    <Dialog open onClose={handleClose} maxWidth="xl">
      <DialogTitle>Cannot create loan</DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <Typography>Doing so would exceed your remaining balance.</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  ) : (
    <Modal
      title={"Manage Purchase Order Financing"}
      dataCy={"create-multiple-financing-requests-modal"}
      primaryActionText={"Save & Submit"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
      isPrimaryActionDisabled={!paymentDate}
      contentWidth={600}
    >
      <Box>
        <Box mb={2}>
          <Typography variant={"body1"}>Selected POs</Typography>
        </Box>
        <Box>
          {!!selectedPurchaseOrderId && (
            <PurchaseOrderDrawer
              purchaseOrderId={selectedPurchaseOrderId}
              handleClose={() => setSelectedPurchaseOrderId(null)}
            />
          )}
          <ControlledDataGrid
            dataSource={rows}
            columns={columns}
            isExcelExport={false}
          />
        </Box>
        <Box mt={4} mb={2}>
          <Typography variant={"body1"}>Request Financing</Typography>
        </Box>
        <DateInputContainer fullWidth>
          <DateInput
            dataCy={"requested-payment-date-date-picker"}
            id="requested-payment-date-date-picker"
            label="Requested Payment Date"
            disablePast
            disableNonBankDays
            value={paymentDate}
            onChange={(value) => setPaymentDate(value)}
            keyboardIcon={<DateInputIcon />}
          />
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              This is the date you want the vendor to receive financing. Within
              banking limitations, Bespoke Financial will try to adhere to this
              request.
            </Typography>
          </Box>
        </DateInputContainer>
        <Box mt={2} mb={6}>
          <Alert severity="info">
            <Typography variant="body1">
              {`You can’t change the amount in multiple Creating mode, in that mode automatically will take the full amount. You can still change the amount in the Creating mode.`}
            </Typography>
          </Alert>
        </Box>
      </Box>
    </Modal>
  );
}

export default ManagePurchaseOrderFinancingModalMultiple;

import { Box, Button, Typography } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import CustomerSurveillanceStatusChip from "components/CustomerSurveillance/CustomerSurveillanceStatusChip";
import InvoiceDrawer from "components/Invoices/InvoiceDrawer";
import LoanDrawerLauncher from "components/Loan/LoanDrawerLauncher";
import BankPurchaseOrderDrawer from "components/PurchaseOrder/v2/BankPurchaseOrderDrawer";
import FinancingRequestStatusChipNew from "components/Shared/Chip/FinancingRequestStatusChipNew";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import PurchaseOrderIdentifierDataGridCell from "components/Shared/DataGrid/PurchaseOrderIdentifierDataGridCell";
import ClickableDataGridCell from "components/Shared/DataGrid/v2/ClickableDataGridCell";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  Invoices,
  LoanArtifactFragment,
  LoanFragment,
  LoanLimitedFragment,
  Loans,
  PurchaseOrders,
} from "generated/graphql";
import { CommentIcon } from "icons";
import { parseDateStringServer } from "lib/date";
import {
  LoanStatusEnum,
  SurveillanceStatusEnum,
  SurveillanceStatusToLabel,
} from "lib/enum";
import {
  createLoanCustomerIdentifier,
  createLoanDisbursementIdentifier,
  getLoanArtifactName,
  getLoanVendorName,
} from "lib/loans";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths, formatRowModel, truncateString } from "lib/tables";
import { useContext, useMemo, useState } from "react";

interface Props {
  financingRequests: LoanLimitedFragment[];
  selectedFinancingRequestIds?: Loans["id"][];
  isApprovalStatusVisible?: boolean;
  isArtifactBankNoteVisible?: boolean;
  isArtifactVisible?: boolean;
  isCompanyNameVisible?: boolean;
  isDisbursementIdentifierVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  isSurveillanceStatusVisible?: boolean;
  isVendorVisible?: boolean;
  showComments?: boolean;
  pager?: boolean;
  handleClickCustomer?: (customerId: Companies["id"]) => void;
  handleClickPurchaseOrderBankNote?: (
    purchaseOrderId: PurchaseOrders["id"]
  ) => void;
  handleSelectFinancingRequests?: (loans: LoanFragment[]) => void;
}

function getSurveillanceResult(financingRequest: any) {
  /*
    This function and it's `any` annotation is a temporary measure to allow
    the loan's action required tab to display the surveillance status before
    we have a chance to refactor the types passed into the LoansDataGrid - which
    will be a much more expansive change
  */
  return !!financingRequest?.company?.most_recent_surveillance_result?.[0]
    ?.surveillance_status
    ? financingRequest.company.most_recent_surveillance_result[0]
        .surveillance_status
    : null;
}

function getRows(financingRequests: LoanLimitedFragment[]) {
  return financingRequests.map((financingRequest) => {
    return formatRowModel({
      ...financingRequest,
      artifact_name: getLoanArtifactName(financingRequest),
      artifact_bank_note: financingRequest.purchase_order
        ? truncateString(
            (financingRequest as LoanArtifactFragment).purchase_order
              ?.bank_note || ""
          )
        : "N/A",
      customer_identifier: createLoanCustomerIdentifier(financingRequest),
      customer_name: financingRequest.company?.name,
      disbursement_identifier:
        createLoanDisbursementIdentifier(financingRequest),
      most_recent_surveillance_status: getSurveillanceResult(financingRequest),
      requested_payment_date: parseDateStringServer(
        financingRequest.requested_payment_date
      ),
      vendor_name: getLoanVendorName(financingRequest),
    });
  });
}

const FinancialRequestsDataGrid = ({
  financingRequests,
  selectedFinancingRequestIds = [],
  isApprovalStatusVisible = true,
  isArtifactVisible = false,
  isArtifactBankNoteVisible = false,
  isCompanyNameVisible = false,
  isDisbursementIdentifierVisible = false,
  isMultiSelectEnabled = false,
  isSurveillanceStatusVisible = false,
  isVendorVisible = false,
  showComments = true,
  pager = false,
  handleClickCustomer,
  handleClickPurchaseOrderBankNote,
  handleSelectFinancingRequests,
}: Props) => {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] =
    useState<PurchaseOrders["id"]>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] =
    useState<Invoices["id"]>(null);

  const rows = getRows(financingRequests);

  const columns = useMemo(
    () => [
      {
        fixed: true,
        caption: "Customer Identifier",
        dataField: "customer_identifier",
        minWidth: ColumnWidths.Identifier,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <LoanDrawerLauncher label={value} loanId={data.id} />
        ),
      },
      {
        fixed: true,
        visible: isDisbursementIdentifierVisible,
        caption: "Disbursement Identifier",
        dataField: "disbursement_identifier",
        minWidth: ColumnWidths.Identifier,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <LoanDrawerLauncher label={value} loanId={data.id} />
        ),
      },
      {
        fixed: true,
        visible: isCompanyNameVisible,
        caption: "Customer Name",
        dataField: "customer_name",
        minWidth: ColumnWidths.MinWidth,
        alignment: "left",
        cellRender: (params: GridValueFormatterParams) =>
          handleClickCustomer ? (
            <ClickableDataGridCell
              label={params.row.data.company.name}
              onClick={() =>
                handleClickCustomer &&
                handleClickCustomer(params.row.data.company_id)
              }
            />
          ) : (
            params.row.data.company.name
          ),
      },
      {
        visible: isApprovalStatusVisible,
        caption: "Approval Status",
        dataField: "status",
        width: ColumnWidths.StatusChip,
        cellRender: ({ value }: { value: string }) => (
          <FinancingRequestStatusChipNew loanStatus={value as LoanStatusEnum} />
        ),
      },
      {
        visible: isSurveillanceStatusVisible,
        dataField: "most_recent_surveillance_status",
        caption: "Surveillance Status",
        width: ColumnWidths.ProductType,
        lookup: {
          dataSource: {
            store: {
              type: "array",
              data: Object.values(SurveillanceStatusEnum).map(
                (surveillanceStatus) => ({
                  surveillance_status: surveillanceStatus,
                  label: SurveillanceStatusToLabel[surveillanceStatus],
                })
              ),
              key: "surveillance_status",
            },
          },
          valueExpr: "surveillance_status",
          displayExpr: "label",
        },
        cellRender: (params: GridValueFormatterParams) => (
          <CustomerSurveillanceStatusChip
            surveillanceStatus={params.row.data.most_recent_surveillance_status}
          />
        ),
      },
      {
        caption: "Amount",
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
        visible: isArtifactVisible,
        dataField: "artifact_name",
        caption: "Purchase Order / Invoice",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) =>
          params.row.data.purchase_order ? (
            <PurchaseOrderIdentifierDataGridCell
              onClick={() => {
                setSelectedPurchaseOrderId(params.row.data.purchase_order.id);
              }}
              artifactName={params.row.data.artifact_name}
              isMetrcBased={params.row.data.purchase_order.is_metrc_based}
            />
          ) : params.row.data.invoice ? (
            <ClickableDataGridCell
              onClick={() => {
                setSelectedInvoiceId(params.row.data.invoice.id);
              }}
              label={params.row.data.artifact_name}
            />
          ) : params.row.data.line_of_credit ? (
            "N/A"
          ) : null,
      },
      {
        visible: isVendorVisible,
        dataField: "vendor_name",
        caption: `Vendor / Payor Name`,
        minWidth: ColumnWidths.MinWidth,
      },
      {
        visible: showComments,
        caption: "Comments",
        dataField: "customer_notes",
        width: 340,
        alignment: "right",
      },
      {
        visible: isArtifactBankNoteVisible,
        dataField: "artifact_bank_note",
        caption: "PO Bank Note",
        width: 340,
        cellRender: (params: GridValueFormatterParams) =>
          params.row.data.artifact_bank_note !== "N/A" ? (
            <Button
              color="default"
              variant="text"
              style={{
                minWidth: 0,
                textAlign: "left",
              }}
              onClick={() =>
                !!handleClickPurchaseOrderBankNote &&
                handleClickPurchaseOrderBankNote(params.row.data.artifact_id)
              }
            >
              <Box display="flex" alignItems="center">
                <CommentIcon />
                {!!params.row.data.artifact_bank_note && (
                  <Box ml={1}>
                    <Typography variant="body2">
                      {params.row.data.artifact_bank_note}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Button>
          ) : (
            params.row.data.artifact_bank_note
          ),
      },
    ],
    [
      isApprovalStatusVisible,
      isArtifactVisible,
      isArtifactBankNoteVisible,
      isCompanyNameVisible,
      isDisbursementIdentifierVisible,
      isSurveillanceStatusVisible,
      isVendorVisible,
      showComments,
      handleClickCustomer,
      handleClickPurchaseOrderBankNote,
    ]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectFinancingRequests &&
        handleSelectFinancingRequests(selectedRowsData as LoanFragment[]),
    [handleSelectFinancingRequests]
  );

  return (
    <Box className="financing-requests-data-grid">
      {!!selectedPurchaseOrderId && (
        <BankPurchaseOrderDrawer
          purchaseOrderId={selectedPurchaseOrderId}
          isBankUser={isBankUser}
          handleClose={() => setSelectedPurchaseOrderId(null)}
        />
      )}
      {!!selectedInvoiceId && (
        <InvoiceDrawer
          invoiceId={selectedInvoiceId}
          handleClose={() => setSelectedInvoiceId(null)}
        />
      )}
      <ControlledDataGrid
        dataSource={rows}
        columns={columns}
        select={isMultiSelectEnabled}
        selectedRowKeys={selectedFinancingRequestIds}
        onSelectionChanged={handleSelectionChanged}
        pager={pager}
      />
    </Box>
  );
};

export default FinancialRequestsDataGrid;

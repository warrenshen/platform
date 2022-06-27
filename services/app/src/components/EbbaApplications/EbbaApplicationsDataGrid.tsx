import { ValueFormatterParams } from "@material-ui/data-grid";
import EbbaApplicationDrawer from "components/EbbaApplication/EbbaApplicationDrawer";
import EbbaApplicationStatusChip from "components/EbbaApplication/EbbaApplicationStatusChip";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import {
  EbbaApplicationFragment,
  EbbaApplications,
  GetOpenEbbaApplicationsByCategoryQuery,
  RequestStatusEnum,
} from "generated/graphql";
import {
  BankEbbaTabLabel,
  CustomerSurveillanceCategoryEnum,
  ProductTypeEnum,
  ProductTypeToLabel,
} from "lib/enum";
import { formatCurrency } from "lib/number";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

interface Props {
  isApprovedAtVisible?: boolean;
  isBorrowingBaseFieldsVisible?: boolean;
  isCategoryVisible?: boolean;
  isCompanyVisible?: boolean;
  isExcelExport?: boolean;
  isExpirationDateVisible?: boolean;
  isMultiSelectEnabled?: boolean;
  isBorrowingBaseAdjustmentAmountVisible?: boolean;
  isBorrowingBaseAdjustmentNoteVisible?: boolean;
  ebbaApplications: GetOpenEbbaApplicationsByCategoryQuery["ebba_applications"];
  selectedEbbaApplicationIds?: EbbaApplications["id"][];
  handleSelectEbbaApplications?: (
    ebbaApplications: EbbaApplicationFragment[]
  ) => void;
}

export default function EbbaApplicationsDataGrid({
  isApprovedAtVisible = false,
  isBorrowingBaseFieldsVisible = false,
  isCategoryVisible = false,
  isCompanyVisible = false,
  isExcelExport = true,
  isExpirationDateVisible = false,
  isMultiSelectEnabled = false,
  isBorrowingBaseAdjustmentAmountVisible = false,
  isBorrowingBaseAdjustmentNoteVisible = false,
  ebbaApplications,
  selectedEbbaApplicationIds,
  handleSelectEbbaApplications,
}: Props) {
  const [selectedEbbaApplicationId, setSelectedEbbaApplicationId] = useState<
    EbbaApplications["id"] | null
  >(null);

  const rows = useMemo(
    () =>
      ebbaApplications.map((ebbaApplication) => {
        const productType = !!ebbaApplication?.company?.contract?.product_type
          ? ProductTypeToLabel[
              ebbaApplication.company.contract.product_type as ProductTypeEnum
            ]
          : null;

        return {
          ...ebbaApplication,
          calculated_borrowing_base: formatCurrency(
            ebbaApplication.calculated_borrowing_base
          ),
          category:
            ebbaApplication.category ===
            CustomerSurveillanceCategoryEnum.BorrowingBase
              ? BankEbbaTabLabel.BorrowingBase
              : BankEbbaTabLabel.FinancialReports,
          company_name: ebbaApplication.company?.name,
          expiration_date: ebbaApplication.expires_date,
          submitted_by_name: ebbaApplication.submitted_by_user?.full_name,
          amount_custom_note: ebbaApplication.amount_custom_note || "-",
          amount_custom: ebbaApplication.amount_custom || "-",
          product_type: productType,
        };
      }),
    [ebbaApplications]
  );

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "id",
        caption: "",
        width: ColumnWidths.Open,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            onClick={() => setSelectedEbbaApplicationId(params.row.data.id)}
            label={"OPEN"}
          />
        ),
      },
      {
        visible: isCompanyVisible,
        dataField: "company_name",
        caption: "Customer Name",
        width: ColumnWidths.Comment,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            url={getBankCompanyRoute(
              params.row.data.company_id,
              isBorrowingBaseFieldsVisible
                ? BankCompanyRouteEnum.BorrowingBase
                : BankCompanyRouteEnum.FinancialCertifications
            )}
            label={params.row.data.company_name}
          />
        ),
      },
      {
        visible: isCategoryVisible,
        dataField: "category",
        caption: "Certification Type",
        width: ColumnWidths.Status,
      },
      // {
      //   dataField: "product_type",
      //   caption: "Current Product",
      //   alignment: "center",
      //   width: ColumnWidths.Status,
      //   allowGrouping: true,
      //   lookup: {
      //     dataSource: {
      //       store: {
      //         type: "array",
      //         data: [
      //           {
      //             key: "product_type",
      //             label: "Dispensary",
      //             items: df,
      //           },
      //           {
      //             key: "product_type",
      //             label: "Non-Dispensary",
      //             items: nonDF,
      //           },
      //         ]
      //       }
      //     },
      //     group: "is_dispensary",
      //     valueExpr: "product_type",
      //     displayExpr: "label",
      //   },
      //   cellRender: (params: ValueFormatterParams) => {
      //     return (<>{ params.row.data.product_type }</>);
      //   }
      // },
      {
        dataField: "status",
        caption: "Status",
        width: ColumnWidths.Status,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <EbbaApplicationStatusChip
            requestStatus={params.row.data.status as RequestStatusEnum}
          />
        ),
      },
      {
        visible: isApprovedAtVisible,
        dataField: "approved_at",
        caption: "Approved At",
        width: ColumnWidths.Datetime,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.approved_at}
          />
        ),
      },
      {
        dataField: "submitted_by_name",
        caption: "Submitted By",
        width: ColumnWidths.UserName,
      },
      {
        dataField: "created_at",
        caption: "Submitted At",
        width: ColumnWidths.Date,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible={false}
            datetimeString={params.row.data.created_at}
          />
        ),
      },
      {
        dataField: "application_date",
        caption: "Certification Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.application_date} />
        ),
      },
      {
        visible: isExpirationDateVisible,
        dataField: "expiration_date",
        caption: "Expiration Date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.expiration_date} />
        ),
      },
      {
        visible: isBorrowingBaseFieldsVisible,
        dataField: "calculated_borrowing_base",
        caption: "Calculated Borrowing Base",
        alignment: "right",
        width: ColumnWidths.Currency,
      },
      {
        visible: isBorrowingBaseFieldsVisible,
        dataField: "monthly_accounts_receivable",
        caption: "Accounts Receivable Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell
            value={params.row.data.monthly_accounts_receivable}
          />
        ),
      },
      {
        visible: isBorrowingBaseFieldsVisible,
        dataField: "monthly_inventory",
        caption: "Inventory Balance",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.monthly_inventory} />
        ),
      },
      {
        visible: isBorrowingBaseFieldsVisible,
        dataField: "monthly_cash",
        caption: "Cash in Deposit Accounts",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.monthly_cash} />
        ),
      },
      {
        visible: isBorrowingBaseFieldsVisible,
        dataField: "amount_cash_in_daca",
        caption: "Cash in DACA Deposit Accounts",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.amount_cash_in_daca} />
        ),
      },
      {
        visible: isBorrowingBaseAdjustmentAmountVisible,
        dataField: "amount_custom",
        caption: "Borrowing Base Adjustment Amount",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        visible: isBorrowingBaseAdjustmentNoteVisible,
        dataField: "amount_custom_note",
        caption: "Borrowing Base Adjustment Note",
        width: ColumnWidths.Date,
        alignment: "right",
      },
    ],
    [
      isApprovedAtVisible,
      isBorrowingBaseFieldsVisible,
      isBorrowingBaseAdjustmentAmountVisible,
      isBorrowingBaseAdjustmentNoteVisible,
      isCategoryVisible,
      isCompanyVisible,
      isExpirationDateVisible,
    ]
  );

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        handleSelectEbbaApplications &&
        handleSelectEbbaApplications(
          selectedRowsData as EbbaApplicationFragment[]
        ),
    [handleSelectEbbaApplications]
  );

  return (
    <>
      {!!selectedEbbaApplicationId && (
        <EbbaApplicationDrawer
          ebbaApplicationId={selectedEbbaApplicationId}
          handleClose={() => setSelectedEbbaApplicationId(null)}
        />
      )}
      <ControlledDataGrid
        isExcelExport={isExcelExport}
        pager
        select={isMultiSelectEnabled}
        filtering={{ enable: true }}
        dataSource={rows}
        columns={columns}
        selectedRowKeys={selectedEbbaApplicationIds}
        onSelectionChanged={handleSelectionChanged}
      />
    </>
  );
}

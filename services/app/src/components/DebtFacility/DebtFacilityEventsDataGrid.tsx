import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import CurrencyDataGridCell from "components/Shared/DataGrid/CurrencyDataGridCell";
import DateDataGridCell from "components/Shared/DataGrid/DateDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import { DebtFacilityEventFragment } from "generated/graphql";
import {
  DebtFacilityEventCategoryEnum,
  DebtFacilityEventCategoryToLabel,
  DebtFacilityStatusEnum,
  DebtFacilityStatusToLabel,
} from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  events: DebtFacilityEventFragment[];
  isMiniTable?: Boolean;
  isExcelExport?: boolean;
  isLoanEvent?: boolean;
  isCompanyEvent?: boolean;
}

function getRows(events: DebtFacilityEventFragment[]): RowsProp {
  return events.map((event) => ({
    ...event,
    formatted_event_category: !!event.event_category
      ? DebtFacilityEventCategoryToLabel[
          event.event_category as DebtFacilityEventCategoryEnum
        ]
      : "",
    payload_user_name:
      !!event.event_payload && event.event_payload.hasOwnProperty("user_name")
        ? event.event_payload["user_name"]
        : "",
    prior_status:
      !!event.event_payload && event.event_payload.hasOwnProperty("old_status")
        ? DebtFacilityStatusToLabel[
            event.event_payload["old_status"] as DebtFacilityStatusEnum
          ]
        : "",
    changed_status:
      !!event.event_payload && event.event_payload.hasOwnProperty("new_status")
        ? DebtFacilityStatusToLabel[
            event.event_payload["new_status"] as DebtFacilityStatusEnum
          ]
        : "",
    debt_facility:
      !!event.event_payload &&
      event.event_payload.hasOwnProperty("debt_facility")
        ? event.event_payload["debt_facility"]
        : "",
  }));
}

export default function TransactionsDataGrid({
  events,
  isMiniTable = false,
  isExcelExport = true,
  isLoanEvent = false,
  isCompanyEvent = false,
}: Props) {
  const rows = useMemo(() => getRows(events), [events]);

  const columns = useMemo(
    () => [
      {
        caption: "Event Date",
        dataField: "event_date",
        width: ColumnWidths.Date,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <DateDataGridCell dateString={params.row.data.event_date} />
        ),
      },
      {
        caption: "Category",
        dataField: "formatted_event_category",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.formatted_event_category} />
        ),
      },

      {
        visible: isLoanEvent,
        caption: "Amount",
        dataField: "event_amount",
        width: ColumnWidths.Currency,
        alignment: "right",
        cellRender: (params: ValueFormatterParams) => (
          <CurrencyDataGridCell value={params.row.data.event_amount} />
        ),
      },
      {
        caption: "Prior Status",
        dataField: "prior_status",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.prior_status} />
        ),
      },
      {
        caption: "Changed Status",
        dataField: "changed_status",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.changed_status} />
        ),
      },
      {
        caption: "Debt Facility",
        dataField: "debt_facility",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.debt_facility} />
        ),
      },
      {
        caption: "User",
        dataField: "payload_user_name",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.payload_user_name} />
        ),
      },
      {
        caption: "Event Comments",
        dataField: "event_comments",
        width: ColumnWidths.Type,
        alignment: "center",
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.event_comments} />
        ),
      },
    ],
    [isLoanEvent]
  );

  return (
    <ControlledDataGrid
      pager
      dataSource={rows}
      columns={columns}
      isExcelExport={isExcelExport}
    />
  );
}

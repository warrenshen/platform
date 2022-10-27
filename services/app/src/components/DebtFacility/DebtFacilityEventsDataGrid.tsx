import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { DebtFacilityEventFragment } from "generated/graphql";
import {
  DebtFacilityEventCategoryEnum,
  DebtFacilityEventCategoryToLabel,
  DebtFacilityStatusEnum,
  DebtFacilityStatusToLabel,
} from "lib/enum";
import { CurrencyPrecision } from "lib/number";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  events: DebtFacilityEventFragment[];
  isMiniTable?: Boolean;
  isExcelExport?: boolean;
  isLoanEvent?: boolean;
  isCompanyEvent?: boolean;
}

function getRows(events: DebtFacilityEventFragment[]) {
  return events.map((event) => ({
    ...event,
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
        format: "shortDate",
        width: ColumnWidths.Date,
        alignment: "right",
      },
      {
        caption: "Category",
        dataField: "formatted_event_category",
        width: ColumnWidths.Type,
        alignment: "center",
      },

      {
        visible: isLoanEvent,
        caption: "Amount",
        dataField: "event_amount",
        format: {
          type: "currency",
          precision: CurrencyPrecision,
        },
        width: ColumnWidths.Currency,
        alignment: "right",
      },
      {
        caption: "Prior Status",
        dataField: "prior_status",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        caption: "Changed Status",
        dataField: "changed_status",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        caption: "Debt Facility",
        dataField: "debt_facility",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        caption: "User",
        dataField: "payload_user_name",
        width: ColumnWidths.Type,
        alignment: "center",
      },
      {
        caption: "Event Comments",
        dataField: "event_comments",
        width: ColumnWidths.Type,
        alignment: "center",
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

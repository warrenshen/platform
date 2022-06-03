import { Button } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  CustomerSurveillanceResultFragment,
  CustomerSurveillanceResults,
} from "generated/graphql";
import { QualifyForEnum, QualifyForToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  surveillanceResults: CustomerSurveillanceResultFragment[];
  handleClickSurveillanceResultsBankNote?: (
    id: CustomerSurveillanceResults["id"]
  ) => void;
}

function getRows(
  customerSurveillanceResults: CustomerSurveillanceResultFragment[]
): RowsProp {
  return customerSurveillanceResults.map((customerSurveillanceResult) => ({
    ...customerSurveillanceResult,
    qualifying_product:
      QualifyForToLabel[
        customerSurveillanceResult?.qualifying_product as QualifyForEnum
      ],
  }));
}

export default function CustomerSurveillanceResultDataGrid({
  surveillanceResults,
  handleClickSurveillanceResultsBankNote,
}: Props) {
  const rows = useMemo(
    () => getRows(surveillanceResults),
    [surveillanceResults]
  );

  const columns = useMemo(
    () => [
      {
        dataField: "qualifying_date",
        caption: "Qualifying Date",
        width: ColumnWidths.Checkbox,
      },
      {
        dataField: "qualifying_product",
        caption: "Qualifying Product",
        width: ColumnWidths.UserRole,
      },
      {
        caption: "Bank Note",
        dataField: "bank_note",
        alignment: "center",
        width: ColumnWidths.Actions,
        cellRender: (params: ValueFormatterParams) => (
          <Button
            color="default"
            variant="text"
            style={{
              minWidth: 0,
              textAlign: "center",
            }}
            onClick={() => {
              !!handleClickSurveillanceResultsBankNote &&
                handleClickSurveillanceResultsBankNote(params.row.data.id);
            }}
          >
            {!!params.row.data.bank_note ? <CommentIcon /> : "-"}
          </Button>
        ),
      },
    ],
    [handleClickSurveillanceResultsBankNote]
  );

  return (
    <ControlledDataGrid
      isExcelExport={false}
      dataSource={rows}
      columns={columns}
    />
  );
}

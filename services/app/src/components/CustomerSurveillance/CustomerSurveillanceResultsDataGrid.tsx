import { Button } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import {
  CustomerSurveillanceResultFragment,
  CustomerSurveillanceResults,
} from "generated/graphql";
import {
  QualifyForEnum,
  QualifyForToLabel,
  SurveillanceStatusEnum,
  SurveillanceStatusToLabel,
} from "lib/enum";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

interface Props {
  surveillanceResults: CustomerSurveillanceResultFragment[];
  handleClickBankNote: (id: CustomerSurveillanceResults["id"]) => void;
}

function getRows(
  surveillanceResults: CustomerSurveillanceResultFragment[]
): RowsProp {
  return surveillanceResults.map((surveillanceResult) => {
    return formatRowModel({
      ...surveillanceResult,
      qualifying_product:
        QualifyForToLabel[
          surveillanceResult?.qualifying_product as QualifyForEnum
        ],
      surveillance_stage:
        SurveillanceStatusToLabel[
          surveillanceResult?.surveillance_status as SurveillanceStatusEnum
        ],
    });
  });
}

export default function CustomerSurveillanceResultDataGrid({
  surveillanceResults,
  handleClickBankNote,
}: Props) {
  const rows = useMemo(
    () => getRows(surveillanceResults),
    [surveillanceResults]
  );

  const columns = useMemo(
    () => [
      {
        dataField: "qualifying_date",
        caption: "Surveillance Date",
        width: ColumnWidths.Date,
      },
      {
        caption: "Bank Note",
        dataField: "bank_note",
        alignment: "center",
        width: ColumnWidths.Open,
        cellRender: (params: ValueFormatterParams) => (
          <Button
            color="default"
            variant="text"
            style={{
              minWidth: 0,
              textAlign: "center",
            }}
            onClick={() => {
              handleClickBankNote(params.row.data.bank_note);
            }}
          >
            {!!params.row.data.bank_note ? <CommentIcon /> : "-"}
          </Button>
        ),
      },
      {
        dataField: "qualifying_product",
        caption: "Qualifying Product",
        width: ColumnWidths.Status,
      },
      {
        dataField: "surveillance_stage",
        caption: "Surveillance Stage",
        width: ColumnWidths.Status,
      },
    ],
    [handleClickBankNote]
  );

  return (
    <ControlledDataGrid
      isExcelExport={false}
      dataSource={rows}
      columns={columns}
    />
  );
}
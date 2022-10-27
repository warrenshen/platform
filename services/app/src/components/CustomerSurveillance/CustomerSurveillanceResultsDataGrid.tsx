import { Box, Button, IconButton } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import CommentIcon from "@material-ui/icons/Comment";
import DeleteIcon from "@material-ui/icons/Delete";
import DeleteSurveillanceResultModal from "components/CustomerSurveillance/DeleteSurveillanceResultModal";
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
import { useMemo, useState } from "react";

interface Props {
  surveillanceResults: CustomerSurveillanceResultFragment[];
  handleClickBankNote: (id: CustomerSurveillanceResults["id"]) => void;
}

function getRows(surveillanceResults: CustomerSurveillanceResultFragment[]) {
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
  const [surveillanceResultId, setSurveillanceResultId] =
    useState<CustomerSurveillanceResults["id"]>(null);

  const rows = useMemo(
    () => getRows(surveillanceResults),
    [surveillanceResults]
  );

  const columns = useMemo(
    () => [
      {
        // purposefully blank caption
        width: ColumnWidths.IconButton,
        cellRender: (params: GridValueFormatterParams) => (
          <Box>
            <IconButton
              onClick={() => {
                setSurveillanceResultId(params.row.data.id);
              }}
              color={"primary"}
              size={"small"}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      },
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
        cellRender: (params: GridValueFormatterParams) => (
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
    <>
      {!!surveillanceResultId && (
        <DeleteSurveillanceResultModal
          surveillanceResultId={surveillanceResultId}
          handleClose={() => {
            setSurveillanceResultId(null);
          }}
        />
      )}
      <ControlledDataGrid
        isExcelExport={false}
        dataSource={rows}
        columns={columns}
      />
    </>
  );
}

import { Button } from "@material-ui/core";
import CommentIcon from "@material-ui/icons/Comment";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import {
  CompanyProductQualificationFragment,
  CompanyProductQualifications,
} from "generated/graphql";
import { QualifyForEnum, QualifyForToLabel } from "lib/enum";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

interface Props {
  productQualifications: CompanyProductQualificationFragment[];
  handleClickProductQualificationBankNote?: (
    id: CompanyProductQualifications["id"]
  ) => void;
}

function getRows(
  companyProductQualifications: CompanyProductQualificationFragment[]
): RowsProp {
  return companyProductQualifications.map((companyProductQualification) => ({
    ...companyProductQualification,
    qualifying_product:
      QualifyForToLabel[
        companyProductQualification?.qualifying_product as QualifyForEnum
      ],
  }));
}

export default function CompanyProductQualificationDataGrid({
  productQualifications,
  handleClickProductQualificationBankNote,
}: Props) {
  const rows = useMemo(() => getRows(productQualifications), [
    productQualifications,
  ]);

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
              !!handleClickProductQualificationBankNote &&
                handleClickProductQualificationBankNote(params.row.data.id);
            }}
          >
            {!!params.row.data.bank_note ? <CommentIcon /> : "-"}
          </Button>
        ),
      },
    ],
    [handleClickProductQualificationBankNote]
  );

  return (
    <ControlledDataGrid
      isExcelExport={false}
      dataSource={rows}
      columns={columns}
    />
  );
}

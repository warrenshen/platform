import { RowsProp } from "@material-ui/data-grid";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import PayorDrawer from "components/Payors/PayorDrawer";
import VerificationChip from "components/Vendors/VerificationChip";
import { PayorPartnershipFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

const verificationCellRenderer = (params: ValueFormatterParams) => (
  <VerificationChip value={params.value} />
);

function getRows(payorPartnerships: PayorPartnershipFragment[]): RowsProp {
  return payorPartnerships.map((payorPartnership) => {
    return {
      ...payorPartnership,
      payor_name: payorPartnership.payor?.name,
      is_verified_license: (payorPartnership.payor?.licenses || []).length > 0,
      is_approved: !!payorPartnership.approved_at,
    };
  });
}

interface Props {
  isBankAccount?: boolean;
  isExcelExport?: boolean;
  isDrilldownByCustomer?: boolean;
  payorPartnerships: PayorPartnershipFragment[];
}

export default function PayorPartnershipsDataGrid({
  isBankAccount,
  isExcelExport = true,
  isDrilldownByCustomer,
  payorPartnerships,
}: Props) {
  const [open, setOpen] = useState(false);

  const [
    currentPayorPartnershipId,
    setCurrentPayorPartnershipId,
  ] = useState<string>();

  const onCellClick = useMemo(
    () => ({ id }: { id: string }) => {
      !open && setOpen(true);
      setCurrentPayorPartnershipId(id);
    },
    [open, setOpen, setCurrentPayorPartnershipId]
  );

  const rows = getRows(payorPartnerships);
  const columns = useMemo(
    () => [
      {
        dataField: "payor.name",
        caption: "Payor Name",
        minWidth: ColumnWidths.MinWidth,
        ...(isBankAccount && {
          cellRender: ({ value, data }: { value: string; data: any }) => (
            <ClickableDataGridCell
              onClick={() => {
                onCellClick(data);
              }}
              label={value}
            />
          ),
        }),
      },
      {
        visible: !!isDrilldownByCustomer ? false : !!isBankAccount,
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "payor_agreement_id",
        caption: "Signed Payor Agreement",
        alignment: "center",
        width: isBankAccount ? 195 : 225,
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "is_verified_license",
        caption: "Verified License",
        alignment: "center",
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "is_approved",
        caption: "Approved",
        alignment: "center",
        cellRender: verificationCellRenderer,
      },
    ],
    [isBankAccount, isDrilldownByCustomer, onCellClick]
  );

  return (
    <>
      {open && currentPayorPartnershipId && (
        <PayorDrawer
          partnershipId={currentPayorPartnershipId}
          handleClose={() => setOpen(false)}
        />
      )}
      <ControlledDataGrid
        pager
        dataSource={rows}
        columns={columns}
        filtering={{ enable: true, filterBy: { index: 0, value: "" } }}
        isExcelExport={isExcelExport}
      />
    </>
  );
}

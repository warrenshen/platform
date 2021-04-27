import { Box } from "@material-ui/core";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import VendorDrawer from "components/Vendors/VendorDrawer";
import VerificationChip from "components/Vendors/VerificationChip";
import { VendorPartnershipFragment } from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

interface Props {
  isBankUserRole?: boolean;
  isExcelExport?: boolean;
  isDrilldownByCustomer?: boolean;
  vendorPartnerships: VendorPartnershipFragment[];
}

function VendorPartnershipsDataGrid({
  isBankUserRole,
  isExcelExport = false,
  isDrilldownByCustomer,
  vendorPartnerships,
}: Props) {
  const [open, setOpen] = useState(false);
  const [
    currentVendorPartnership,
    setCurrentVendorPartnership,
  ] = useState<string>();

  const onCellClick = useMemo(
    () => ({ id }: { id: string }) => {
      !open && setOpen(true);
      setCurrentVendorPartnership(id);
    },
    [open, setOpen, setCurrentVendorPartnership]
  );

  const verificationCellRenderer = useMemo(
    () => ({ value }: { value: string }) => <VerificationChip value={value} />,
    []
  );

  const rows = vendorPartnerships;
  const columns = useMemo(
    () => [
      {
        dataField: "vendor.name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
        ...(isBankUserRole && {
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
        visible: !!isDrilldownByCustomer ? false : !!isBankUserRole,
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "vendor_agreement_id",
        caption: "Signed Vendor Agreement",
        alignment: "center",
        width: isBankUserRole ? 195 : 225,
        calculateCellValue: (data: any) =>
          !!data.vendor_agreement_id ? "Yes" : "No",
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "vendor_license_id",
        caption: "Verified license",
        alignment: "center",
        calculateCellValue: (data: any) =>
          !!data.vendor_license_id ? "Yes" : "No",
        cellRender: verificationCellRenderer,
      },
      {
        visible: !!isBankUserRole,
        dataField: "vendor_bank_account.verified_at",
        caption: "Verified Bank account",
        alignment: "center",
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "approved_at",
        caption: "Approved",
        alignment: "center",
        cellRender: verificationCellRenderer,
      },
    ],
    [
      isBankUserRole,
      isDrilldownByCustomer,
      onCellClick,
      verificationCellRenderer,
    ]
  );

  // Example of columns sorting callback
  const onSortingChanged = (index: number, order: string) => {
    console.log(index, order);
  };

  // Example of columns filtering callback
  const onFilteringChanged = (index: number, value: string) => {
    console.log(index, value);
  };

  return (
    <>
      {open && currentVendorPartnership && (
        <VendorDrawer
          vendorPartnershipId={currentVendorPartnership}
          onClose={() => setOpen(false)}
        />
      )}
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <ControlledDataGrid
          isExcelExport={isExcelExport}
          pager
          dataSource={rows}
          onSortingChanged={onSortingChanged}
          onFilteringChanged={onFilteringChanged}
          columns={columns}
        />
      </Box>
    </>
  );
}

export default VendorPartnershipsDataGrid;

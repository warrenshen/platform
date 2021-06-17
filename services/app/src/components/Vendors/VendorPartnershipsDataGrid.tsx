import { RowsProp } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import VendorDrawer from "components/Vendors/VendorDrawer";
import VerificationChip from "components/Vendors/VerificationChip";
import {
  VendorPartnershipFragment,
  VendorPartnershipLimitedFragment,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

function getRows(
  vendorPartnerships: (
    | VendorPartnershipFragment
    | VendorPartnershipLimitedFragment
  )[]
): RowsProp {
  return vendorPartnerships.map((vendorPartnership) => {
    return {
      ...vendorPartnership,
      vendor_name: vendorPartnership.vendor?.name,
      is_verified_bank_account: !!(vendorPartnership as VendorPartnershipFragment)
        .vendor_bank_account?.verified_at,
      is_verified_license:
        (vendorPartnership.vendor?.licenses || []).length > 0,
      is_approved: !!vendorPartnership.approved_at,
    };
  });
}

interface Props {
  isBankUserRole?: boolean;
  isDrilldownByCustomer?: boolean;
  isExcelExport?: boolean;
  vendorPartnerships: (
    | VendorPartnershipFragment
    | VendorPartnershipLimitedFragment
  )[];
}

export default function VendorPartnershipsDataGrid({
  isBankUserRole,
  isExcelExport = true,
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

  const rows = getRows(vendorPartnerships);
  const columns = useMemo(
    () => [
      {
        dataField: "vendor_name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
        ...(isBankUserRole && {
          cellRender: ({ value, data }: { value: string; data: any }) => (
            <ClickableDataGridCell
              onClick={() => onCellClick(data)}
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
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "is_verified_license",
        caption: "Verified License",
        alignment: "center",
        cellRender: verificationCellRenderer,
      },
      {
        visible: !!isBankUserRole,
        dataField: "is_verified_bank_account",
        caption: "Verified Bank account",
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
      <ControlledDataGrid
        isExcelExport={isExcelExport}
        pager
        dataSource={rows}
        onSortingChanged={onSortingChanged}
        onFilteringChanged={onFilteringChanged}
        columns={columns}
      />
    </>
  );
}

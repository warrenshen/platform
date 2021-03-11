import { Box } from "@material-ui/core";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import VendorDrawer from "components/Vendors/VendorDrawer";
import VerificationChip from "components/Vendors/VerificationChip";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

function VendorPartnershipsDataGrid({
  isBankAccount,
  isDrilldownByCustomer,
  data,
}: {
  isBankAccount?: boolean;
  isDrilldownByCustomer?: boolean;
  data: any;
}) {
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

  const columns = useMemo(
    () => [
      {
        dataField: isBankAccount ? "vendor.name" : "vendor_limited.name",
        caption: "Vendor Name",
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
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        visible: !!isDrilldownByCustomer ? false : !!isBankAccount,
      },
      {
        dataField: "address",
        caption: "Address",
        visible: !!isDrilldownByCustomer,
      },
      {
        dataField: "phone_number",
        caption: "Phone Number",
        visible: !!isDrilldownByCustomer,
      },
      {
        dataField: "vendor_agreement_id",
        caption: "Signed Vendor Agreement",
        alignment: "center",
        width: isBankAccount ? 195 : 225,
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "vendor_license_id",
        caption: "Verified license",
        alignment: "center",
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "vendor_bank_account.verified_at",
        caption: "Verified Bank account",
        visible: !!isBankAccount,
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
      isBankAccount,
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
          dataSource={data}
          onSortingChanged={onSortingChanged}
          onFilteringChanged={onFilteringChanged}
          sortBy={{ index: 0, order: "desc" }}
          filtering={{ enable: true, filterBy: { index: 0, value: "" } }}
          columns={columns}
          pager
        />
      </Box>
    </>
  );
}

export default VendorPartnershipsDataGrid;

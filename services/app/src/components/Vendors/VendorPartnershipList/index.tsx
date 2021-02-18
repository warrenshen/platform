import { Box } from "@material-ui/core";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import VendorDrawer from "components/Vendors/VendorDrawer";
import { useState } from "react";
import VerificationChip from "./VerificationChip";

function VendorPartnershipList({
  data,
  isBankAccount,
  isDrilldownByCustomer,
}: {
  data: any;
  isBankAccount?: boolean;
  isDrilldownByCustomer?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [
    currentVendorPartnership,
    setCurrentVendorPartnership,
  ] = useState<string>();

  const onCellClick = ({ id }: { id: string }) => {
    !open && setOpen(true);
    setCurrentVendorPartnership(id);
  };

  const verificationCellRenderer = ({ value }: { value: string }) => (
    <VerificationChip value={value} />
  );

  const vendorNameCellRenderer = ({
    value,
    data,
  }: {
    value: string;
    data: any;
  }) => (
    <ClickableDataGridCell
      onClick={() => {
        onCellClick(data);
      }}
      label={value}
    />
  );

  const columnWidth = isBankAccount ? 195 : 225;

  const columns = [
    {
      dataField: isBankAccount ? "vendor.name" : "vendor_limited.name",
      caption: "Vendor name",
      ...(isBankAccount && { cellRender: vendorNameCellRenderer }),
    },
    {
      dataField: "company.name",
      caption: "Company name",
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
      width: columnWidth,
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
  ];

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
          filtering={{ enable: true, filterBy: { index: 0, value: "Canna" } }}
          columns={columns}
          pager
        />
      </Box>
    </>
  );
}

export default VendorPartnershipList;

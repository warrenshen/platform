import { Box } from "@material-ui/core";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import VendorDrawer from "components/Vendors/Bank/VendorDrawer";
import { useState } from "react";
import VerificationChip from "./VerificationChip";

function VendorPartnershipList({
  data,
  isBankAccount,
}: {
  data: any;
  isBankAccount?: boolean;
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
      visible: !!isBankAccount,
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

  return (
    <>
      {open && currentVendorPartnership && (
        <VendorDrawer
          vendorPartnershipId={currentVendorPartnership}
          onClose={() => setOpen(false)}
        ></VendorDrawer>
      )}
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <ControlledDataGrid dataSource={data} columns={columns} pager />
      </Box>
    </>
  );
}

export default VendorPartnershipList;

import { useState } from "react";
import { makeStyles } from "@material-ui/core";
import DataGrid, {
  Column,
  IColumnProps,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import VendorDrawer from "components/Vendors/Bank/VendorDrawer";
import VerificationChip from "./VerificationChip";

const useStyles = makeStyles({
  vendorNameCell: {
    cursor: "pointer",
    transition: "color 0.2s linear",
    "&:hover": {
      color: "var(--table-accent-color)",
    },
  },
});

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

  const classes = useStyles();

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
    <div onClick={() => onCellClick(data)} className={classes.vendorNameCell}>
      {value}
    </div>
  );

  const columnWidth = isBankAccount ? 200 : 225;

  const columns: IColumnProps[] = [
    {
      dataField: isBankAccount ? "vendor.name" : "vendor_limited.name",
      caption: "Vendor name",
      minWidth: 200,
      ...(isBankAccount && { cellRender: vendorNameCellRenderer }),
    },
    ...(isBankAccount
      ? [
          {
            dataField: "company.name",
            caption: "Company name",
            minWidth: 200,
          },
        ]
      : []),
    {
      dataField: "vendor_agreement_id",
      caption: "Signed Vendor Agreement",
      alignment: "center",
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
      width: isBankAccount ? columnWidth : 0,
      visible: isBankAccount,
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
      <div style={{ height: "80vh", width: "100%" }}>
        <DataGrid height={"100%"} width={"100%"} dataSource={data}>
          {columns.map(
            ({ dataField, alignment, width, caption, cellRender }) => (
              <Column
                key={dataField}
                caption={caption}
                dataField={dataField}
                alignment={alignment}
                width={width}
                cellRender={cellRender}
              />
            )
          )}
          <Paging defaultPageSize={50} />
          <Pager
            visible={true}
            showPageSizeSelector={true}
            allowedPageSizes={[10, 20, 50]}
            showInfo={true}
          />
        </DataGrid>
      </div>
    </>
  );
}

export default VendorPartnershipList;

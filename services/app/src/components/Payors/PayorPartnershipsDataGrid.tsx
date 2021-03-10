import { Box } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import VerificationChip from "components/Vendors/VerificationChip";
import { useMemo } from "react";

const verificationCellRenderer = (params: ValueFormatterParams) => (
  <VerificationChip value={params.value} />
);

export default function PayorPartnershipsDataGrid({
  isBankAccount,
  isDrilldownByCustomer,
  data,
}: {
  isBankAccount?: boolean;
  isDrilldownByCustomer?: boolean;
  data: any;
}) {
  const columns = useMemo(
    () => [
      {
        dataField: isBankAccount ? "payor.name" : "payor_limited.name",
        caption: "Payor Name",
        ...(isBankAccount && {
          cellRender: ({ value, data }: { value: string; data: any }) => (
            <ClickableDataGridCell
              onClick={() => {
                // TODO(pjstein): Do the PayorsDrawer and use the new style
                // for launching the drawer.
                console.log(data);
              }}
              label={value}
            />
          ),
        }),
      },
      {
        dataField: "company.name",
        caption: "Customer Name",
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
        dataField: "approved_at",
        caption: "Approved",
        alignment: "center",
        cellRender: verificationCellRenderer,
      },
    ],
    [isBankAccount, isDrilldownByCustomer]
  );

  return (
    <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
      <ControlledDataGrid
        pager
        dataSource={data}
        columns={columns}
        filtering={{ enable: true, filterBy: { index: 0, value: "" } }}
      />
    </Box>
  );
}

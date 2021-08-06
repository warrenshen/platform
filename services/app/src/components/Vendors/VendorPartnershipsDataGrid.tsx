import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import VendorPartnershipDrawer from "components/Partnership/VendorPartnershipDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import VerificationChip from "components/Vendors/VerificationChip";
import {
  CompanyVendorPartnerships,
  VendorPartnershipFragment,
  VendorPartnershipLimitedFragment,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
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
      vendor_name: getCompanyDisplayName(vendorPartnership.vendor),
      is_verified_bank_account: !!(vendorPartnership as VendorPartnershipFragment)
        .vendor_bank_account?.verified_at,
      is_verified_license:
        (vendorPartnership.vendor?.licenses || []).length > 0,
      is_approved: !!vendorPartnership.approved_at,
    };
  });
}

interface Props {
  isDrilldownByCustomer?: boolean;
  isExcelExport?: boolean;
  isRoleBankUser?: boolean;
  vendorPartnerships: (
    | VendorPartnershipFragment
    | VendorPartnershipLimitedFragment
  )[];
}

export default function VendorPartnershipsDataGrid({
  isExcelExport = true,
  isDrilldownByCustomer = false,
  isRoleBankUser = false,
  vendorPartnerships,
}: Props) {
  const [
    selectedVendorPartnershipId,
    setSelectedVendorPartnershipId,
  ] = useState<CompanyVendorPartnerships["id"] | null>(null);

  const verificationCellRenderer = useMemo(
    () => ({ value }: { value: string }) => <VerificationChip value={value} />,
    []
  );

  const rows = getRows(vendorPartnerships);
  const columns = useMemo(
    () => [
      {
        visible: isRoleBankUser,
        fixed: true,
        dataField: "id",
        caption: "",
        width: ColumnWidths.Open,
        cellRender: (params: ValueFormatterParams) => (
          <ClickableDataGridCell
            onClick={() => setSelectedVendorPartnershipId(params.row.data.id)}
            label={"OPEN"}
          />
        ),
      },
      {
        dataField: "vendor_name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
        ...(isRoleBankUser && {
          cellRender: ({ value, data }: { value: string; data: any }) => (
            <ClickableDataGridCell
              url={getBankCompanyRoute(
                data.vendor_id,
                BankCompanyRouteEnum.VendorPartnerships
              )}
              label={value}
            />
          ),
        }),
      },
      {
        visible: !!isDrilldownByCustomer ? false : !!isRoleBankUser,
        dataField: "company.name",
        caption: "Customer Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            url={getBankCompanyRoute(
              data.company_id,
              BankCompanyRouteEnum.Overview
            )}
            label={value}
          />
        ),
      },
      {
        dataField: "vendor_agreement_id",
        caption: "Signed Vendor Agreement",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "is_verified_license",
        caption: "Verified License",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: verificationCellRenderer,
      },
      {
        visible: !!isRoleBankUser,
        dataField: "is_verified_bank_account",
        caption: "Verified Bank account",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "is_approved",
        caption: "Approved",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: verificationCellRenderer,
      },
    ],
    [isRoleBankUser, isDrilldownByCustomer, verificationCellRenderer]
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
      {!!selectedVendorPartnershipId && (
        <VendorPartnershipDrawer
          vendorPartnershipId={selectedVendorPartnershipId}
          handleClose={() => setSelectedVendorPartnershipId(null)}
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

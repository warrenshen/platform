import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import VendorPartnershipDrawerLauncher from "components/Partnership/VendorPartnershipDrawerLauncher";
import VerificationChip from "components/Vendors/VerificationChip";
import {
  VendorPartnershipFragment,
  VendorPartnershipLimitedFragment,
} from "generated/graphql";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

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
  const verificationCellRenderer = useMemo(
    () => ({ value }: { value: string }) => <VerificationChip value={value} />,
    []
  );

  const rows = getRows(vendorPartnerships);
  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "id",
        caption: "",
        width: 90,
        cellRender: (params: ValueFormatterParams) => (
          <VendorPartnershipDrawerLauncher
            vendorPartnershipId={params.row.data.id}
          />
        ),
      },
      {
        dataField: "vendor_name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
        ...(isBankUserRole && {
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
        visible: !!isDrilldownByCustomer ? false : !!isBankUserRole,
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
    [isBankUserRole, isDrilldownByCustomer, verificationCellRenderer]
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
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      dataSource={rows}
      onSortingChanged={onSortingChanged}
      onFilteringChanged={onFilteringChanged}
      columns={columns}
    />
  );
}

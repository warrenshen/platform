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

const getIsVerifiedLicenseValue = (vendor: any) => {
  if (!vendor || vendor?.is_cannabis === null) {
    return null;
  }
  return vendor?.licenses.length > 0;
};

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
      is_verified_bank_account: !!(
        vendorPartnership as VendorPartnershipFragment
      ).vendor_bank_account?.verified_at,
      is_verified_license: getIsVerifiedLicenseValue(vendorPartnership.vendor),
      is_approved: !!vendorPartnership.approved_at,
    };
  });
}

interface Props {
  isDrilldownByCustomer?: boolean;
  isExcelExport?: boolean;
  isRoleBankUser?: boolean;
  isVendorAgreementVisible?: boolean;
  vendorPartnerships: (
    | VendorPartnershipFragment
    | VendorPartnershipLimitedFragment
  )[];
  isMultiSelectEnabled?: boolean;
  setSelectedVendorIds?: (vendorId: VendorPartnershipFragment["id"]) => void;
  selectedVendorIds?: VendorPartnershipFragment["id"][];
}

export default function VendorPartnershipsDataGrid({
  isExcelExport = true,
  isDrilldownByCustomer = false,
  isRoleBankUser = false,
  isVendorAgreementVisible = true,
  vendorPartnerships,
  isMultiSelectEnabled = false,
  setSelectedVendorIds,
  selectedVendorIds,
}: Props) {
  const [selectedVendorPartnershipId, setSelectedVendorPartnershipId] =
    useState<CompanyVendorPartnerships["id"] | null>(null);

  const verificationCellRenderer = useMemo(
    () =>
      ({ value }: { value: string }) =>
        <VerificationChip value={value} />,
    []
  );

  const verifiedLicenseCheckboxRenderer = useMemo(
    () =>
      ({ value }: { value: string }) =>
        value === null ? "N/A" : <VerificationChip value={value} />,
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
            onClick={() => {
              setSelectedVendorPartnershipId(params.row.data.id);
            }}
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
        visible: isVendorAgreementVisible,
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
        cellRender: verifiedLicenseCheckboxRenderer,
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
      {
        dataField: "phone_number",
        caption: "Phone Number",
        alignment: "center",
        width: ColumnWidths.Type,
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "email",
        caption: "Email",
        alignment: "center",
        width: ColumnWidths.Type,
        cellRender: verificationCellRenderer,
      },
    ],
    [
      isDrilldownByCustomer,
      isRoleBankUser,
      isVendorAgreementVisible,
      verificationCellRenderer,
      verifiedLicenseCheckboxRenderer,
    ]
  );

  // Example of columns sorting callback
  const onSortingChanged = (index: number, order: string) => {
    // Stub in case needed
  };

  // Example of columns filtering callback
  const onFilteringChanged = (index: number, value: string) => {
    // Stub in case needed
  };

  const handleSelectionChanged = useMemo(
    () =>
      ({ selectedRowsData }: any) =>
        setSelectedVendorIds &&
        setSelectedVendorIds(
          selectedRowsData as VendorPartnershipLimitedFragment[]
        ),
    [setSelectedVendorIds]
  );

  return (
    <>
      {!!selectedVendorPartnershipId && (
        <VendorPartnershipDrawer
          vendorPartnershipId={selectedVendorPartnershipId}
          handleClose={() => setSelectedVendorPartnershipId(null)}
        />
      )}
      <ControlledDataGrid
        select={isMultiSelectEnabled}
        isExcelExport={isExcelExport}
        pager
        dataSource={rows}
        onSortingChanged={onSortingChanged}
        onFilteringChanged={onFilteringChanged}
        onSelectionChanged={handleSelectionChanged}
        selectedRowKeys={selectedVendorIds}
        columns={columns}
      />
    </>
  );
}

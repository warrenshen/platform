import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import VerificationChip from "components/Vendors/v2/VerificationChip";
import { CustomersWithMetadataFragment } from "generated/graphql";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

const getIsVerifiedLicenseValue = (vendor: any) => {
  if (!vendor || vendor?.is_cannabis === null) {
    return null;
  }
  return vendor?.licenses.length > 0;
};

function getRows(vendors: CustomersWithMetadataFragment[]) {
  return vendors.map((vendor) => {
    return {
      ...vendor,
      company_url: getBankCompanyRoute(
        vendor.id,
        BankCompanyRouteEnum.Overview
      ),
      dba_name: vendor?.dba_name || "",
      is_verified_license: getIsVerifiedLicenseValue(vendor),
      vendor_name: vendor?.name || "",
    };
  });
}

interface Props {
  vendors: CustomersWithMetadataFragment[];
}

export default function CompaniesVendorsDataGrid({ vendors }: Props) {
  const verifiedLicenseCheckboxRenderer = useMemo(
    () =>
      ({ value }: { value: string }) =>
        value === null ? "N/A" : <VerificationChip value={value} />,
    []
  );

  const rows = getRows(vendors);
  const columns = useMemo(
    () => [
      {
        dataField: "vendor_name",
        caption: "Vendor Name",
        minWidth: ColumnWidths.MinWidth,
        ...{
          cellRender: ({ value, data }: { value: string; data: any }) => (
            <ClickableDataGridCell
              dataCy={data.cy_identifier}
              url={data.company_url}
              label={value}
            />
          ),
        },
      },
      {
        dataField: "dba_name",
        caption: "DBA",
        minWidth: ColumnWidths.MinWidth,
      },
      {
        dataField: "is_verified_license",
        caption: "Verified License",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: verifiedLicenseCheckboxRenderer,
      },
    ],
    [verifiedLicenseCheckboxRenderer]
  );

  const onFilteringChanged = (index: number, value: string) => {};

  return (
    <>
      <ControlledDataGrid
        pager
        dataSource={rows}
        onFilteringChanged={onFilteringChanged}
        columns={columns}
      />
    </>
  );
}

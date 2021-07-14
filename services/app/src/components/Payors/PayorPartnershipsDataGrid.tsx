import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import PayorPartnershipDrawerLauncher from "components/Partnership/PayorPartnershipDrawerLauncher";
import VerificationChip from "components/Vendors/VerificationChip";
import { PayorPartnershipFragment } from "generated/graphql";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { useMemo } from "react";

const verificationCellRenderer = (params: ValueFormatterParams) => (
  <VerificationChip value={params.value} />
);

function getRows(payorPartnerships: PayorPartnershipFragment[]): RowsProp {
  return payorPartnerships.map((payorPartnership) => {
    return {
      ...payorPartnership,
      payor_name: payorPartnership.payor?.name,
      is_verified_license: (payorPartnership.payor?.licenses || []).length > 0,
      is_approved: !!payorPartnership.approved_at,
    };
  });
}

interface Props {
  isExcelExport?: boolean;
  isDrilldownByCustomer?: boolean;
  isRoleBankUser?: boolean;
  payorPartnerships: PayorPartnershipFragment[];
}

export default function PayorPartnershipsDataGrid({
  isExcelExport = true,
  isDrilldownByCustomer = false,
  isRoleBankUser = false,
  payorPartnerships,
}: Props) {
  const rows = getRows(payorPartnerships);
  const columns = useMemo(
    () => [
      {
        visible: isRoleBankUser,
        fixed: true,
        dataField: "id",
        caption: "",
        width: 90,
        cellRender: (params: ValueFormatterParams) => (
          <PayorPartnershipDrawerLauncher
            payorPartnershipId={params.row.data.id}
          />
        ),
      },
      {
        dataField: "payor.name",
        caption: "Payor Name",
        minWidth: ColumnWidths.MinWidth,
        ...(isRoleBankUser && {
          cellRender: ({ value, data }: { value: string; data: any }) => (
            <ClickableDataGridCell
              url={getBankCompanyRoute(
                data.vendor_id,
                BankCompanyRouteEnum.PayorPartnerships
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
      },
      {
        dataField: "payor_agreement_id",
        caption: "Signed Payor Agreement",
        alignment: "center",
        width: isRoleBankUser ? 195 : 225,
        cellRender: verificationCellRenderer,
      },
      {
        dataField: "is_verified_license",
        caption: "Verified License",
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
    [isRoleBankUser, isDrilldownByCustomer]
  );

  return (
    <ControlledDataGrid
      isExcelExport={isExcelExport}
      pager
      dataSource={rows}
      columns={columns}
      filtering={{ enable: true, filterBy: { index: 0, value: "" } }}
    />
  );
}

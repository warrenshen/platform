import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import PayorPartnershipDrawer from "components/Partnership/PayorPartnershipDrawer";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import VerificationChip from "components/Vendors/VerificationChip";
import {
  CompanyPayorPartnerships,
  PayorPartnershipFragment,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

const verificationCellRenderer = (params: ValueFormatterParams) => (
  <VerificationChip value={params.value} />
);

function getRows(payorPartnerships: PayorPartnershipFragment[]): RowsProp {
  return payorPartnerships.map((payorPartnership) => {
    return {
      ...payorPartnership,
      payor_name: !!payorPartnership.payor
        ? getCompanyDisplayName(payorPartnership.payor)
        : "",
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
  const [selectedPayorPartnershipId, setSelectedPayorPartnershipId] = useState<
    CompanyPayorPartnerships["id"] | null
  >(null);

  const rows = getRows(payorPartnerships);
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
            onClick={() => setSelectedPayorPartnershipId(params.row.data.id)}
            label={"OPEN"}
          />
        ),
      },
      {
        dataField: "payor_name",
        caption: "Payor Name",
        minWidth: ColumnWidths.MinWidth,
        ...(isRoleBankUser && {
          cellRender: ({ value, data }: { value: string; data: any }) => (
            <ClickableDataGridCell
              url={getBankCompanyRoute(
                data.payor_id,
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
        dataField: "payor_agreement_id",
        caption: "Signed Payor Agreement",
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
        dataField: "is_approved",
        caption: "Approved",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: verificationCellRenderer,
      },
    ],
    [isRoleBankUser, isDrilldownByCustomer]
  );

  return (
    <>
      {!!selectedPayorPartnershipId && (
        <PayorPartnershipDrawer
          payorPartnershipId={selectedPayorPartnershipId}
          handleClose={() => setSelectedPayorPartnershipId(null)}
        />
      )}
      <ControlledDataGrid
        isExcelExport={isExcelExport}
        pager
        dataSource={rows}
        columns={columns}
        filtering={{ enable: true, filterBy: { index: 0, value: "" } }}
      />
    </>
  );
}

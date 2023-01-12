import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import { ReactComponent as ParentCompanyIcon } from "components/Shared/Layout/Icons/ParentCompanyGreen.svg";
import { ParentCompanyFragment } from "generated/graphql";
import {
  BankParentCompanyRouteEnum,
  getBankParentCompanyRoute,
} from "lib/routes";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo } from "react";

interface Props {
  parentCompanies: ParentCompanyFragment[];
}

function getRows(parentCompanies: ParentCompanyFragment[]) {
  return parentCompanies.map((company) => {
    return formatRowModel({
      ...company,
      company_url: getBankParentCompanyRoute(
        company?.id || "",
        BankParentCompanyRouteEnum.Details
      ),
      cy_identifier:
        `parent-companies-data-grid-view-customer-button-${company.name}`
          .replace(/\s+/g, "-")
          .toLowerCase(),
      dba_name: company?.id || "",
      name: company?.name || "",
    });
  });
}

export default function ParentCompaniesDataGrid({ parentCompanies }: Props) {
  const rows = parentCompanies ? getRows(parentCompanies) : [];

  const columns = useMemo(
    () => [
      {
        dataField: "name",
        caption: "Parent Company Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            dataCy={data.cy_identifier}
            url={data.company_url}
            label={value}
            Icon={ParentCompanyIcon}
          />
        ),
      },
    ],
    []
  );

  return (
    <ControlledDataGrid
      isExcelExport
      pager
      filtering={{ enable: true }}
      dataSource={rows}
      columns={columns}
    />
  );
}

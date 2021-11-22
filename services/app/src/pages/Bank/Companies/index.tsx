import { Box, TextField } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import CreateCompanyModal from "components/Customer/CreateCompanyModal";
import ClickableDataGridCell from "components/Shared/DataGrid/ClickableDataGridCell";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import ModalButton from "components/Shared/Modal/ModalButton";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import VerificationChip from "components/Vendors/VerificationChip";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { Companies, useGetCompaniesWithMetadataQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { ColumnWidths } from "lib/tables";
import { filter, sortBy } from "lodash";
import { useContext, useMemo, useState } from "react";

export default function BankcompaniesPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const { data, refetch, error } = useGetCompaniesWithMetadataQuery({
    fetchPolicy: "network-only",
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [searchQuery, setSearchQuery] = useState("");

  const companies = useMemo(() => {
    const filteredCompanies = filter(
      data?.companies || [],
      (customer) =>
        `${customer.name} ${customer.dba_name} ${customer.identifier}`
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return sortBy(filteredCompanies, (customer) => customer.name);
  }, [searchQuery, data?.companies]);

  const columns = useMemo(
    () => [
      {
        fixed: true,
        dataField: "name",
        caption: "Company Name",
        minWidth: ColumnWidths.MinWidth,
        cellRender: ({ value, data }: { value: string; data: any }) => (
          <ClickableDataGridCell
            dataCy={`companies-data-grid-view-company-button-${data.identifier}`}
            url={getBankCompanyRoute(data.id, BankCompanyRouteEnum.Overview)}
            label={value}
          />
        ),
      },
      {
        fixed: true,
        dataField: "identifier",
        caption: "Identifier",
        minWidth: ColumnWidths.Identifier,
        width: ColumnWidths.Type,
      },
      {
        dataField: "dba_name",
        caption: "DBA",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.dba_name} />
        ),
      },
      {
        dataField: "is_customer",
        caption: "Customer?",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: ({ value }: { value: string }) => (
          <VerificationChip value={value} />
        ),
      },
      {
        dataField: "is_payor",
        caption: "Payor?",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: ({ value }: { value: string }) => (
          <VerificationChip value={value} />
        ),
      },
      {
        dataField: "is_vendor",
        caption: "Vendor?",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: ({ value }: { value: string }) => (
          <VerificationChip value={value} />
        ),
      },
      {
        dataField: "contract.product_type",
        caption: "Product Type",
        width: ColumnWidths.ProductType,
        calculateCellValue: (data: Companies) =>
          data.contract
            ? ProductTypeToLabel[data.contract.product_type as ProductTypeEnum]
            : "None",
      },
    ],
    []
  );

  return (
    <Page appBarTitle={"Companies"}>
      <PageContent title={"Companies"}>
        <Box
          display="flex"
          style={{ marginBottom: "1rem" }}
          justifyContent="space-between"
        >
          <Box display="flex">
            <TextField
              autoFocus
              label="Search by company identifier or name"
              value={searchQuery}
              onChange={({ target: { value } }) => setSearchQuery(value)}
              style={{ width: 300 }}
            />
          </Box>
          <Box display="flex" flexDirection="row-reverse">
            {check(role, Action.EditCustomerSettings) && (
              <Box>
                <ModalButton
                  dataCy={"create-company-button"}
                  label={"Create Company"}
                  color={"primary"}
                  modal={({ handleClose }) => (
                    <CreateCompanyModal
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                    />
                  )}
                />
              </Box>
            )}
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <ControlledDataGrid
            isExcelExport
            pager
            dataSource={companies}
            columns={columns}
          />
        </Box>
      </PageContent>
    </Page>
  );
}

import { Box } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import { Alert } from "@material-ui/lab";
import MetrcApiKeyInfo from "components/Metrc/MetrcApiKeyInfo";
import DeleteMetrcKeyModal from "components/Settings/Bank/DeleteMetrcKeyModal";
import UpsertMetrcKeyModal from "components/Settings/Bank/UpsertMetrcKeyModal";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import ModalButton from "components/Shared/Modal/ModalButton";
import VerificationChip from "components/Vendors/VerificationChip";
import {
  Companies,
  MetrcApiKeyFragment,
  MetrcApiKeys,
  useGetMetrcApiKeysByCompanyIdQuery,
} from "generated/graphql";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
}

function getRows(metrcApiKeys: MetrcApiKeyFragment[]): RowsProp {
  return metrcApiKeys.map((metrcApiKey, index) => ({
    ...metrcApiKey,
    number: index + 1,
  }));
}

export default function MetrcApiKeysList({ companyId }: Props) {
  const { data, refetch } = useGetMetrcApiKeysByCompanyIdQuery({
    variables: {
      companyId: companyId,
    },
  });

  const [selectedMetrcKeyIds, setSelectedMetrcKeyIds] = useState<
    MetrcApiKeys["id"]
  >([]);
  const metrcApiKeys = useMemo(() => data?.metrc_api_keys || [], [data]);
  const rows = useMemo(() => getRows(metrcApiKeys), [metrcApiKeys]);

  const columns = useMemo(
    () => [
      {
        dataField: "number",
        caption: "Key #",
        alignment: "left",
      },
      {
        dataField: "us_state",
        caption: "US State",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.us_state} />
        ),
      },
      {
        dataField: "use_saved_licenses_only",
        caption: "Use Saved Licenses Only?",
        minWidth: ColumnWidths.MinWidth,
        cellRender: ({ value }: { value: string }) => (
          <VerificationChip value={value} />
        ),
      },
      {
        dataField: "is_functioning",
        caption: "Functioning?",
        alignment: "center",
        width: ColumnWidths.Checkbox,
        cellRender: ({ value }: { value: string }) => (
          <VerificationChip value={value} />
        ),
      },
      {
        dataField: "last_used_at",
        caption: "Last Used At",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.last_used_at}
          />
        ),
      },
      {
        dataField: "created_at",
        caption: "Created At",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.created_at}
          />
        ),
      },
    ],
    []
  );

  const handleSelectApiKeys = useMemo(
    () => (metrcKeys: MetrcApiKeyFragment[]) => {
      setSelectedMetrcKeyIds(metrcKeys.map((metrcKey) => metrcKey.id));
    },
    []
  );

  const handleSelectionChanged = useMemo(
    () => ({ selectedRowsData }: any) =>
      handleSelectApiKeys(selectedRowsData as MetrcApiKeyFragment[]),
    [handleSelectApiKeys]
  );

  const selectedMetrcApiKey = useMemo(
    () =>
      selectedMetrcKeyIds.length === 1
        ? metrcApiKeys.find(
            (metrcApiKey) => metrcApiKey.id === selectedMetrcKeyIds[0]
          )
        : null,
    [metrcApiKeys, selectedMetrcKeyIds]
  );

  return (
    <Box>
      {metrcApiKeys.length > 0 ? (
        <Box mt={1}>
          <Alert severity="info">Metrc API key(s) set up</Alert>
        </Box>
      ) : (
        <Box mt={1}>
          <Alert severity="warning">Metrc API key(s) NOT set up yet</Alert>
        </Box>
      )}
      <Box mt={2}>
        <Box display="flex" flexDirection="row-reverse">
          <Box>
            <ModalButton
              isDisabled={selectedMetrcKeyIds.length >= 1}
              label={"Add API Key"}
              modal={({ handleClose }) => (
                <UpsertMetrcKeyModal
                  companyId={companyId}
                  metrcApiKey={null}
                  handleClose={() => {
                    handleClose();
                    refetch();
                  }}
                />
              )}
            />
          </Box>
          <Box mr={2}>
            <ModalButton
              isDisabled={selectedMetrcKeyIds.length !== 1}
              label={"Edit API Key"}
              modal={({ handleClose }) => (
                <UpsertMetrcKeyModal
                  companyId={companyId}
                  metrcApiKey={selectedMetrcApiKey}
                  handleClose={() => {
                    handleClose();
                    refetch();
                  }}
                />
              )}
            />
          </Box>
          <Box mr={2}>
            <ModalButton
              isDisabled={selectedMetrcKeyIds.length !== 1}
              label={"Delete API Key"}
              variant={"outlined"}
              modal={({ handleClose }) => (
                <DeleteMetrcKeyModal
                  companyId={companyId}
                  metrcApiKey={selectedMetrcApiKey}
                  handleClose={() => {
                    handleClose();
                    refetch();
                  }}
                />
              )}
            />
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <ControlledDataGrid
          isExcelExport={false}
          isSortingDisabled={false}
          pager={false}
          select={true}
          pageSize={10}
          dataSource={rows}
          columns={columns}
          selectedRowKeys={selectedMetrcKeyIds}
          onSelectionChanged={handleSelectionChanged}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        {metrcApiKeys.map((metrcApiKey, index) => (
          <MetrcApiKeyInfo
            key={metrcApiKey.id}
            number={index + 1}
            metrcApiKey={metrcApiKey}
          />
        ))}
      </Box>
    </Box>
  );
}

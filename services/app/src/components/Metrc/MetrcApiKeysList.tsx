import { Box } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import { Alert } from "@material-ui/lab";
import DeleteMetrcKeyModal from "components/Metrc/DeleteMetrcKeyModal";
import MetrcApiKeyDrawer from "components/Metrc/MetrcApiKeyDrawer";
import RefreshMetrcKeyPermissionsModal from "components/Metrc/RefreshMetrcKeyPermissionsModal";
import UpsertMetrcKeyModal from "components/Metrc/UpsertMetrcKeyModal";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import ClickableDataGridCell from "components/Shared/DataGrid/v2/ClickableDataGridCell";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  MetrcApiKeyFragment,
  MetrcApiKeys,
  useGetMetrcApiKeysByCompanyIdQuery,
} from "generated/graphql";
import { formatDatetimeString } from "lib/date";
import { ColumnWidths, formatRowModel } from "lib/tables";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
}

function getRows(metrcApiKeys: MetrcApiKeyFragment[]) {
  return metrcApiKeys.map((metrcApiKey, index) =>
    formatRowModel({
      ...metrcApiKey,
      number: index + 1,
      is_functioning: !!metrcApiKey.is_functioning,
      permissions_refreshed_at: formatDatetimeString(
        metrcApiKey.permissions_refreshed_at,
        true,
        "Never"
      ),
      last_used_at: formatDatetimeString(
        metrcApiKey.last_used_at,
        true,
        "Never"
      ),
    })
  );
}

export default function MetrcApiKeysList({ companyId }: Props) {
  const { data, refetch } = useGetMetrcApiKeysByCompanyIdQuery({
    variables: {
      companyId: companyId,
    },
  });

  const [openedMetrcApiKeyId, setOpenedMetrcApiKeyId] = useState(null);
  const [selectedMetrcKeyIds, setSelectedMetrcKeyIds] = useState<
    MetrcApiKeys["id"]
  >([]);
  const metrcApiKeys = useMemo(() => data?.metrc_api_keys || [], [data]);
  const rows = useMemo(() => getRows(metrcApiKeys), [metrcApiKeys]);

  const columns = useMemo(
    () => [
      {
        fixed: true,
        caption: "ID",
        alignment: "left",
        width: ColumnWidths.Type,
        cellRender: (params: GridValueFormatterParams) => (
          <ClickableDataGridCell
            onClick={() => {
              setOpenedMetrcApiKeyId(params.row.data.id);
            }}
            label={params.row.data.id}
          />
        ),
      },
      {
        dataField: "us_state",
        caption: "US State",
        width: ColumnWidths.UsState,
        cellRender: (params: GridValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.us_state} />
        ),
      },
      {
        dataField: "is_functioning",
        caption: "Is Working?",
        alignment: "center",
        width: ColumnWidths.Checkbox,
      },
      {
        dataField: "permissions_refreshed_at",
        caption: "Last Refreshed At",
        width: ColumnWidths.Datetime,
      },
      {
        dataField: "last_used_at",
        caption: "Last Used At",
        width: ColumnWidths.Datetime,
      },
      {
        dataField: "created_at",
        caption: "Created At",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: GridValueFormatterParams) => (
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
    () =>
      ({ selectedRowsData }: any) =>
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

  const isMetrcApiKeyWorking =
    metrcApiKeys.length > 0 && metrcApiKeys[0].is_functioning;
  const isMetrcApiKeyNew =
    !isMetrcApiKeyWorking &&
    metrcApiKeys.length > 0 &&
    !metrcApiKeys[0].permissions_refreshed_at;

  return (
    <Box>
      {!!openedMetrcApiKeyId && (
        <MetrcApiKeyDrawer
          metrcApiKeyId={openedMetrcApiKeyId}
          handleClose={() => setOpenedMetrcApiKeyId(null)}
        />
      )}
      <Box mt={2}>
        {isMetrcApiKeyWorking ? (
          <Alert severity="success">
            <strong>
              Metrc API key is working! Open up the Metrc API key to view more
              information.
            </strong>
          </Alert>
        ) : isMetrcApiKeyNew ? (
          <Alert severity="warning">
            <strong>
              Metrc API key is new. Please refresh the Metrc API key to
              determine whether it works.
            </strong>
          </Alert>
        ) : (
          <Alert severity="error">
            <strong>
              Metrc API key is not working or does not exist. Please set up a
              new Metrc API key.
            </strong>
          </Alert>
        )}
      </Box>
      <Box mt={2}>
        <Box display="flex" flexDirection="row-reverse">
          <Box>
            <ModalButton
              isDisabled={selectedMetrcKeyIds.length >= 1}
              label={"Create API Key"}
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
              label={"Refresh API Key"}
              modal={({ handleClose }) => (
                <RefreshMetrcKeyPermissionsModal
                  metrcApiKeyId={selectedMetrcApiKey?.id}
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
    </Box>
  );
}

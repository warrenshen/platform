import { Box, Typography } from "@material-ui/core";
import { RowsProp, ValueFormatterParams } from "@material-ui/data-grid";
import { Alert } from "@material-ui/lab";
import DeleteMetrcKeyModal from "components/Settings/Bank/DeleteMetrcKeyModal";
import UpsertMetrcKeyModal from "components/Settings/Bank/UpsertMetrcKeyModal";
import APIStatusChip from "components/Shared/Chip/APIStatusChip";
import ControlledDataGrid from "components/Shared/DataGrid/ControlledDataGrid";
import DatetimeDataGridCell from "components/Shared/DataGrid/DatetimeDataGridCell";
import TextDataGridCell from "components/Shared/DataGrid/TextDataGridCell";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  Companies,
  CompanySettings,
  MetrcApiKeyFragment,
  useGetMetrcApiKeysPerCompanyQuery,
} from "generated/graphql";
import { formatDatetimeString } from "lib/date";
import { ColumnWidths } from "lib/tables";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
  companySettingsId: CompanySettings["id"];
  metrcApiKey: MetrcApiKeyFragment;
  handleDataChange: () => void;
}

interface StatusProps {
  metrcKey: MetrcApiKeyFragment;
}

function MetrcApiStatusChip({
  label,
  statusCode,
}: {
  label: string;
  statusCode: number;
}) {
  return (
    <Box display="flex" justifyContent="space-between" mt={1} mr={1}>
      <Typography color="textSecondary" variant="body1">
        {`${label} API:`}
      </Typography>
      <Box>
        <APIStatusChip statusCode={statusCode} />
      </Box>
    </Box>
  );
}

function StatusOfKey({ metrcKey }: StatusProps) {
  return (
    <Box mt={2}>
      <Box>
        <Typography variant="body1">{`Is Functioning?: ${
          metrcKey.is_functioning ? "Yes" : "No"
        }`}</Typography>
      </Box>
      <Box mt={2}>
        <Typography variant="body1">
          {`Last used at: ${
            metrcKey.last_used_at
              ? formatDatetimeString(metrcKey.last_used_at)
              : "None"
          }`}
        </Typography>
      </Box>
      {metrcKey.status_codes_payload &&
        Object.keys(metrcKey.status_codes_payload).map((licenseNum) => {
          const statusesObj = metrcKey.status_codes_payload[licenseNum];
          return (
            <Box key={licenseNum} display="flex" flexDirection="column" mt={2}>
              <Box mb={2}>
                <Typography variant="body1">
                  {`License number: ${licenseNum}`}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" width={500} pl={2}>
                <Box mb={2}>
                  <Box mb={1}>
                    <Typography variant="subtitle2">
                      <b>Transfers</b>
                    </Typography>
                  </Box>
                  <MetrcApiStatusChip
                    label={"Transfers"}
                    statusCode={statusesObj.transfers_api}
                  />
                  <MetrcApiStatusChip
                    label={"Transfer Packages"}
                    statusCode={statusesObj.transfer_packages_api}
                  />
                  <MetrcApiStatusChip
                    label={"Transfer Packages Wholesale"}
                    statusCode={statusesObj.transfer_packages_wholesale_api}
                  />
                  <MetrcApiStatusChip
                    label={"Lab Results"}
                    statusCode={statusesObj.lab_results_api}
                  />
                </Box>
                <Box mb={2}>
                  <Box mb={1}>
                    <Typography variant="subtitle2">
                      <b>Packages (Inventory)</b>
                    </Typography>
                  </Box>
                  <MetrcApiStatusChip
                    label={"Packages"}
                    statusCode={statusesObj.packages_api}
                  />
                </Box>
                <Box mb={2}>
                  <Box mb={1}>
                    <Typography variant="subtitle2">
                      <b>Cultivation</b>
                    </Typography>
                  </Box>
                  <MetrcApiStatusChip
                    label={"Plants"}
                    statusCode={statusesObj.plants_api}
                  />
                  <MetrcApiStatusChip
                    label={"Plant Batches"}
                    statusCode={statusesObj.plant_batches_api}
                  />
                  <MetrcApiStatusChip
                    label={"Harvests"}
                    statusCode={statusesObj.harvests_api}
                  />
                </Box>
                <Box mb={2}>
                  <Box mb={1}>
                    <Typography variant="subtitle2">
                      <b>Sales</b>
                    </Typography>
                  </Box>
                  <MetrcApiStatusChip
                    label={"Sales Receipts"}
                    statusCode={statusesObj.sales_receipts_api}
                  />
                  <MetrcApiStatusChip
                    label={"Sales Transactions"}
                    statusCode={statusesObj.sales_transactions_api}
                  />
                </Box>
              </Box>
            </Box>
          );
        })}
    </Box>
  );
}

function getRows(metrcApiKeys: MetrcApiKeyFragment[]): RowsProp {
  return metrcApiKeys.map((metrcApiKey) => ({
    ...metrcApiKey,
  }));
}

export default function MetrcApiKeys({
  companyId,
  companySettingsId,
  metrcApiKey,
  handleDataChange,
}: Props) {
  const hasKey = !!metrcApiKey;

  const { data, refetch } = useGetMetrcApiKeysPerCompanyQuery({
    variables: {
      companyId: companyId,
    },
  });

  const [selectedMetrcKeyIds, setSelectedMetrcKeyIds] = useState<string[]>([]);
  const metrcApiKeys = useMemo(() => data?.metrc_api_keys || [], [data]);
  const rows = useMemo(() => getRows(metrcApiKeys), [metrcApiKeys]);

  const columns = useMemo(
    () => [
      {
        dataField: "us_state",
        caption: "US State",
        visible: true,
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.us_state} />
        ),
      },
      {
        dataField: "created_at",
        caption: "Created At",
        visible: true,
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
      {hasKey ? (
        <Box mt={1}>
          <Alert severity="info">Metrc API key is set up</Alert>
        </Box>
      ) : (
        <Box mt={1}>
          <Alert severity="warning">Metrc API key is NOT set up yet</Alert>
        </Box>
      )}
      <Box mt={2}>
        <Box display="flex" flexDirection="row-reverse">
          <Box ml={2}>
            {selectedMetrcKeyIds.length === 1 && (
              <Box>
                <ModalButton
                  label={"Delete API Key"}
                  modal={({ handleClose }) => (
                    <DeleteMetrcKeyModal
                      metrcApiKey={selectedMetrcApiKey}
                      companySettingsId={companySettingsId}
                      handleClose={() => {
                        handleDataChange();
                        handleClose();
                        refetch();
                      }}
                    />
                  )}
                />
              </Box>
            )}
          </Box>
          {selectedMetrcKeyIds.length === 1 && (
            <Box>
              <ModalButton
                label={"Edit API Key"}
                modal={({ handleClose }) => (
                  <UpsertMetrcKeyModal
                    metrcApiKey={selectedMetrcApiKey}
                    companySettingsId={companySettingsId}
                    handleClose={() => {
                      handleDataChange();
                      handleClose();
                      refetch();
                    }}
                  />
                )}
              />
            </Box>
          )}
          <Box mr={2}>
            <ModalButton
              label={"Add API Key"}
              modal={({ handleClose }) => (
                <UpsertMetrcKeyModal
                  metrcApiKey={null}
                  companySettingsId={companySettingsId}
                  handleClose={() => {
                    handleDataChange();
                    handleClose();
                    refetch();
                  }}
                />
              )}
            />
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
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
      {hasKey && <StatusOfKey metrcKey={metrcApiKey}></StatusOfKey>}
    </Box>
  );
}

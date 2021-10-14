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
import VerificationChip from "components/Vendors/VerificationChip";
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
}

interface StatusProps {
  number: number;
  metrcApiKey: MetrcApiKeyFragment;
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

function StatusOfKey({ number, metrcApiKey }: StatusProps) {
  return (
    <Box mt={2}>
      <Box>
        <Typography variant="subtitle1">
          <b>{`Key #${number}`}</b>
        </Typography>
      </Box>
      <Box mt={2}>
        <Typography variant="body2">{`Is Functioning?: ${
          metrcApiKey.is_functioning ? "Yes" : "No"
        }`}</Typography>
      </Box>
      <Box mt={2}>
        <Typography variant="body2">
          {`Last used at: ${
            metrcApiKey.last_used_at
              ? formatDatetimeString(metrcApiKey.last_used_at)
              : "None"
          }`}
        </Typography>
      </Box>
      {metrcApiKey.status_codes_payload &&
        Object.keys(metrcApiKey.status_codes_payload).map((licenseNum) => {
          const statusesObj = metrcApiKey.status_codes_payload[licenseNum];
          return (
            <Box key={licenseNum} display="flex" flexDirection="column" mt={2}>
              <Box mb={2}>
                <Typography variant="body2">
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
  return metrcApiKeys.map((metrcApiKey, index) => ({
    ...metrcApiKey,
    number: index + 1,
  }));
}

export default function MetrcApiKeys({ companyId, companySettingsId }: Props) {
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
        dataField: "number",
        caption: "Key #",
        alignment: "left",
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
        dataField: "us_state",
        caption: "US State",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <TextDataGridCell label={params.row.data.us_state} />
        ),
      },
      {
        dataField: "last_used_at",
        caption: "Last Used At",
        minWidth: ColumnWidths.MinWidth,
        cellRender: (params: ValueFormatterParams) => (
          <DatetimeDataGridCell
            isTimeVisible
            datetimeString={params.row.data.created_at}
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
            <Box>
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
          <StatusOfKey
            key={metrcApiKey.id}
            number={index + 1}
            metrcApiKey={metrcApiKey}
          />
        ))}
      </Box>
    </Box>
  );
}

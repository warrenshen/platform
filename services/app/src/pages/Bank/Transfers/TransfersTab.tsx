import {
  Box,
  Button,
  createStyles,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import DateInput from "components/Shared/FormInputs/DateInput";
import TransferPackagesDataGrid from "components/Transfers/TransferPackagesDataGrid";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { getTransfersMutation, TransferPackage } from "lib/api/metrc";
import { todayAsDateStringServer } from "lib/date";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",

      width: "100%",
    },
    section: {
      display: "flex",
      flexDirection: "column",
    },
    sectionSpace: {
      marginBottom: theme.spacing(4),
    },
    inputField: {
      width: 200,
    },
  })
);

export default function BankTransfersTab() {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [licenseId, setLicenseId] = useState<string>("");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(
    todayAsDateStringServer()
  );

  const [transferPackages, setTransferPackages] = useState<TransferPackage[]>(
    []
  );

  const [getTransfers, { loading: isGetTransfersLoading }] = useCustomMutation(
    getTransfersMutation
  );

  const handleSubmit = async () => {
    setTransferPackages([]);

    const response = await getTransfers({
      variables: {
        license_id: licenseId,
        start_date: startDate,
        end_date: endDate,
      },
    });

    if (response.status !== "OK") {
      console.log({ response });
      snackbar.showError(
        "Unauthorized: please double check that authorization is set up correctly."
      );
    } else {
      snackbar.showSuccess("Metrc information found.");

      const data = response.data;
      const transferRows = data.transfer_rows;
      const transferPackageRows = data.transfer_package_rows;
      const deliveryIdToTransferRow = {} as { [deliveryId: string]: any };
      transferRows.forEach((transfer: any, index: number) => {
        if (index === 0) {
          return;
        }
        deliveryIdToTransferRow[transfer[1] as string] = transfer;
      });

      const transferPackages = transferPackageRows
        .slice(1)
        .map((transferPackageRow: any, index: number) => {
          const deliveryId = transferPackageRow[0];
          const transferRow = deliveryIdToTransferRow[deliveryId];
          return {
            transfer_id: transferRow[0],
            // delivery_id: transferRow[1],
            manifest_number: transferRow[2],
            origin_license: transferRow[3],
            origin_facility: transferRow[4],
            destination_license: transferRow[5],
            destination_facility: transferRow[6],
            type: transferRow[7],

            // Package fields.
            package_id: transferPackageRow[1],
            package_number: transferPackageRow[2],
            package_type: transferPackageRow[3],
            item: transferPackageRow[4],
            item_category: transferPackageRow[5],
            item_strain_name: transferPackageRow[6],
            item_state: transferPackageRow[7],
            received_quantity: transferPackageRow[8],
            uom: transferPackageRow[9],
            item_unit_quantity: transferPackageRow[10],
            item_unit_weight: transferPackageRow[11],
            is_testing_sample: transferPackageRow[12],
          };
        });

      setTransferPackages(transferPackages);
    }
  };

  const isSubmitDisabled = isGetTransfersLoading;

  return (
    <Box className={classes.container}>
      <Box className={classes.section} mt={4}>
        <Box display="flex" alignItems="center" mb={2}>
          <Box>
            <TextField
              className={classes.inputField}
              label="License ID"
              required
              value={licenseId}
              onChange={({ target: { value } }) => {
                setLicenseId(value);
              }}
            />
          </Box>
          <Box ml={2}>
            <DateInput
              className={classes.inputField}
              id="start-date-date-picker"
              label="Start Date"
              disableFuture
              value={startDate}
              onChange={(value) =>
                setStartDate(value || todayAsDateStringServer())
              }
            />
          </Box>
          <Box ml={2}>
            <DateInput
              className={classes.inputField}
              id="end-date-date-picker"
              label="End Date"
              disableFuture
              value={endDate}
              onChange={(value) =>
                setEndDate(value || todayAsDateStringServer())
              }
            />
          </Box>
          <Box ml={2}>
            <Button
              disabled={isSubmitDisabled}
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <TransferPackagesDataGrid transferPackages={transferPackages} />
        </Box>
      </Box>
    </Box>
  );
}

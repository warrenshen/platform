import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import DatePicker from "components/Shared/Dates/DatePicker";
import {
  Contracts,
  ContractsInsertInput,
  useGetContractQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { terminateContract } from "lib/customer/contracts";
import { isNull, mergeWith } from "lodash";
import { useState } from "react";

const useStyles = makeStyles({
  section: {
    fontWeight: 400,
    fontSize: "18px",
    marginTop: "1.5rem",
    "&:first-of-type": {
      marginTop: 0,
    },
  },
  sectionName: {
    marginBottom: "1.5rem",
  },
  inputField: {
    width: 300,
  },
  datePicker: {
    width: 300,
    marginTop: 0,
    marginBottom: 0,
  },
  dialogTitle: {
    borderBottom: "1px solid #c7c7c7",
    marginBottom: "1rem",
  },
  errorBox: {
    color: "red",
    position: "absolute",
    bottom: "1rem",
  },
});

interface Props {
  contractId: Contracts["id"];
  handleClose: () => void;
}

function TerminateContractModal({ contractId, handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  // Default Contract while existing one is loading.
  const newContract = {
    end_date: null,
  } as ContractsInsertInput;

  const [contract, setContract] = useState(newContract);

  useGetContractQuery({
    variables: { id: contractId },
    onCompleted: (data) => {
      const existingContract = data?.contracts_by_pk;
      if (!existingContract) {
        alert("Error quertying contract");
      } else {
        setContract(
          mergeWith(newContract, existingContract, (a, b) =>
            isNull(b) ? a : b
          )
        );
      }
    },
  });

  const [terminationDate, setTerminationDate] = useState<string | null>(null);

  const handleClickSave = async () => {
    const response = await terminateContract({
      contract_id: contractId,
      termination_date: terminationDate,
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Error: could not create customer! Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Success! Contract terminated successfully.");
      handleClose();
    }
  };

  return (
    <Dialog open onClose={handleClose} fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        Terminate Contract
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box mb={3}>
            <DatePicker
              disabled
              className={classes.inputField}
              id="end-date-date-picker"
              label="Expected End Date"
              value={contract.end_date}
              onChange={() => {}}
            />
          </Box>
          <Box mb={3}>
            <DatePicker
              disableFuture
              className={classes.inputField}
              id="termination-date-date-picker"
              label="Termination Date"
              value={terminationDate}
              onChange={(value) => setTerminationDate(value)}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          <Box pr={1}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              disabled={!terminationDate}
              variant="contained"
              color="primary"
              type="submit"
              onClick={handleClickSave}
            >
              Save
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default TerminateContractModal;

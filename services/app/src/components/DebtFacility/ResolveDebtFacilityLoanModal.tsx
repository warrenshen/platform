import {
  Box,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Autocomplete from "@material-ui/lab/Autocomplete";
import DateInput from "components/Shared/FormInputs/DateInput";
import Modal from "components/Shared/Modal/Modal";
import { OpenLoanForDebtFacilityFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { resolveLoansForDebtFacility } from "lib/api/debtFacility";
import { getEndOfNextMonth } from "lib/date";
import { DebtFacilityStatusEnum, DebtFacilityStatusToLabel } from "lib/enum";
import { formatCurrency } from "lib/number";
import { useMemo, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  selectedLoan: OpenLoanForDebtFacilityFragment;
  handleClose: () => void;
}

export default function ResolveDebtFacilityLoanModal({
  selectedLoan,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionStatus, setResolutionStatus] = useState("");
  const [waiverDate, setWaiverDate] = useState("");
  const [waiverExpirationDate, setWaiverExpirationDate] = useState("");

  const [resolveLoans, { loading: isResolveLoansLoading }] = useCustomMutation(
    resolveLoansForDebtFacility
  );

  const debtFacilityName = selectedLoan?.loan_report?.debt_facility?.name || "";

  const resolutionOptions = useMemo(() => {
    return [DebtFacilityStatusEnum.Repurchased, DebtFacilityStatusEnum.Waiver];
  }, []);

  // Submission Handler
  const handleClick = async () => {
    const response = await resolveLoans({
      variables: {
        loanId: selectedLoan.id,
        resolveNote: resolutionNote,
        resolveStatus: resolutionStatus,
        waiverDate: waiverDate,
        waiverExpirationDate: waiverExpirationDate,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Successfully resolved loan");
      handleClose();
    }
  };

  const getDefaultExpirationDate = (value: string | null) => {
    return !!value ? getEndOfNextMonth(value) : "";
  };

  return (
    <Modal
      dataCy={"move-debt-facility-loan-modal"}
      isPrimaryActionDisabled={
        isResolveLoansLoading ||
        !resolutionStatus ||
        !resolutionNote ||
        (resolutionStatus === DebtFacilityStatusEnum.Waiver &&
          (waiverDate === "" || waiverExpirationDate === ""))
      }
      title={"Resolve Loan's Status in Debt Facility"}
      contentWidth={800}
      primaryActionText={"Submit Resolve Request"}
      handleClose={handleClose}
      handlePrimaryAction={() => handleClick()}
    >
      <Box display="flex" flexDirection="column">
        {debtFacilityName === "" && (
          <Box mt={4}>
            <Alert severity="info">
              <Typography variant="body1">
                The debt facility associated with this loan is invalid. Please
                reach out to the engineering team for assistance.
              </Typography>
            </Alert>
          </Box>
        )}
        {debtFacilityName !== "" && (
          <Box mt={4}>
            <Alert severity="info">
              <Typography variant="body1">
                To resolve this status, you must either repurchase the loan into
                Bespoke's books or get a waiver to keep it in the debt facility.
              </Typography>
            </Alert>
          </Box>
        )}
        <Box mt={4} width={"50%"}>
          <Autocomplete
            autoHighlight
            id="auto-complete-debt-facility-loan-resolution"
            className={classes.inputField}
            options={resolutionOptions}
            getOptionLabel={(resolutionOption) => {
              return `${DebtFacilityStatusToLabel[resolutionOption]}`;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={"Resolution Options"}
                variant="outlined"
              />
            )}
            onChange={(_event, resolutionOption) => {
              if (resolutionOption !== DebtFacilityStatusEnum.Waiver) {
                setWaiverDate("");
                setWaiverExpirationDate("");
              }
              setResolutionStatus(resolutionOption || "");
            }}
          />
        </Box>
        {resolutionStatus === DebtFacilityStatusEnum.Waiver && (
          <>
            <Box mt={4}>
              <DateInput
                disableNonBankDays
                className={classes.inputField}
                id="debt-facility-waiver-date-picker"
                label="Waiver Date"
                value={waiverDate}
                onChange={(value) => {
                  setWaiverDate(value || "");
                  setWaiverExpirationDate(
                    getDefaultExpirationDate(value) || ""
                  );
                }}
              />
            </Box>
            <Box mt={4}>
              <DateInput
                disableNonBankDays
                className={classes.inputField}
                id="debt-facility-waiver-expiration-date-picker"
                label="Waiver Expiration Date"
                value={waiverExpirationDate}
                onChange={(value) => setWaiverExpirationDate(value || "")}
              />
            </Box>
          </>
        )}
        <Box mt={4}>
          <TextField
            multiline
            className={classes.inputField}
            label={"Resolve Notes"}
            placeholder={"Please enter update notes"}
            value={resolutionNote}
            onChange={({ target: { value } }) => setResolutionNote(value)}
          />
        </Box>
        <Box mt={4}>
          <Typography variant="body2" color="textSecondary">
            Company
          </Typography>
          <Box>{selectedLoan.company.name}</Box>
        </Box>
        <Box mt={4}>
          <Typography variant="body2" color="textSecondary">
            Debt Facility
          </Typography>
          <Box>{selectedLoan.loan_report?.debt_facility?.name || ""}</Box>
        </Box>
        <Box mt={4}>
          <Typography variant="body2" color="textSecondary">
            Maturity Date
          </Typography>
          <Box>{selectedLoan.adjusted_maturity_date}</Box>
        </Box>
        <Box mt={4}>
          <Typography variant="body2" color="textSecondary">
            Outstanding Principal
          </Typography>
          <Box>
            {formatCurrency(selectedLoan.outstanding_principal_balance)}
          </Box>
        </Box>
        <Box mt={4}>
          <Typography variant="body2" color="textSecondary">
            Outstanding Interest
          </Typography>
          <Box>{formatCurrency(selectedLoan.outstanding_interest)}</Box>
        </Box>
        <Box mt={4}>
          <Typography variant="body2" color="textSecondary">
            Outstanding Late Fees
          </Typography>
          <Box>{formatCurrency(selectedLoan.outstanding_fees)}</Box>
        </Box>
      </Box>
    </Modal>
  );
}

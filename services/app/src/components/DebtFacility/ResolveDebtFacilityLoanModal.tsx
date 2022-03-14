import { Box, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { resolveLoansForDebtFacility } from "lib/api/debtFacility";
import { DebtFacilityStatusEnum, DebtFacilityStatusToLabel } from "lib/enum";
import { OpenLoanForDebtFacilityFragment } from "generated/graphql";
import { formatCurrency } from "lib/number";
import { useMemo, useState } from "react";

interface Props {
  selectedLoan: OpenLoanForDebtFacilityFragment;
  facilityId: string;
  handleClose: () => void;
}

export default function ResolveDebtFacilityLoanModal({
  selectedLoan,
  facilityId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionStatus, setResolutionStatus] = useState("");

  const [resolveLoans, { loading: isResolveLoansLoading }] = useCustomMutation(
    resolveLoansForDebtFacility
  );

  const debtFacilityName = selectedLoan?.loan_report?.debt_facility?.name || "";

  const resolutionOptions = useMemo(() => {
    return [DebtFacilityStatusEnum.REPURCHASED, DebtFacilityStatusEnum.WAIVER];
  }, []);

  // Submission Handler
  const handleClick = async () => {
    const response = await resolveLoans({
      variables: {
        loanId: selectedLoan.id,
        facilityId: facilityId,
        resolveNote: resolutionNote,
        resolveStatus: resolutionStatus,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Successfully resolved loan");
      handleClose();
    }
  };

  return (
    <Modal
      dataCy={"move-debt-facility-loan-modal"}
      isPrimaryActionDisabled={
        isResolveLoansLoading || !resolutionStatus || !resolutionNote
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
        <Box mt={4} mb={4} width={"50%"}>
          <Autocomplete
            autoHighlight
            id="auto-complete-debt-facility-loan-resolution"
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
              setResolutionStatus(resolutionOption || "");
            }}
          />
        </Box>
        <TextField
          multiline
          label={"Resolve Notes"}
          placeholder={"Please enter notes on this status update"}
          value={resolutionNote}
          onChange={({ target: { value } }) => setResolutionNote(value)}
        />
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

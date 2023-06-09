import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import DateInput from "components/Shared/FormInputs/DateInput";
import Modal from "components/Shared/Modal/Modal";
import { CustomersWithMetadataFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { updateCompanyDebtFacilityStatus } from "lib/api/debtFacility";
import { getEndOfNextMonth } from "lib/date";
import {
  DebtFacilityCompanyStatusEnum,
  DebtFacilityCompanyStatusToLabel,
} from "lib/enum";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  selectedCompany: CustomersWithMetadataFragment;
  handleClose: () => void;
}

export default function UpdateCompanyDebtFacilityStatusModal({
  selectedCompany,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();
  const [selectedDebtFacilityStatus, setSelectedDebtFacilityStatus] =
    useState<DebtFacilityCompanyStatusEnum>(
      selectedCompany.debt_facility_status as DebtFacilityCompanyStatusEnum
    );
  const [statusComment, setStatusComment] = useState("");
  const [waiverDate, setWaiverDate] = useState("");
  const [waiverExpirationDate, setWaiverExpirationDate] = useState("");

  const [
    updateCompanyStatus,
    { loading: isUpdateCompanyDebtFacilityStatusLoading },
  ] = useCustomMutation(updateCompanyDebtFacilityStatus);

  // Submission Handler
  const handleClick = async () => {
    const response = await updateCompanyStatus({
      variables: {
        companyId: selectedCompany.id,
        debtFacilityStatus: selectedDebtFacilityStatus,
        statusChangeComment: statusComment,
        waiverDate: waiverDate,
        waiverExpirationDate: waiverExpirationDate,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess(
        "Successfully updated company's debt facility status"
      );
      handleClose();
    }
  };

  const getDefaultExpirationDate = (value: string | null) => {
    return !!value ? getEndOfNextMonth(value) : "";
  };

  return (
    <Modal
      dataCy={"update-company-debt-facility-status-modal"}
      isPrimaryActionDisabled={
        (selectedDebtFacilityStatus === selectedCompany.debt_facility_status &&
          selectedDebtFacilityStatus !==
            DebtFacilityCompanyStatusEnum.Waiver) ||
        isUpdateCompanyDebtFacilityStatusLoading ||
        (selectedDebtFacilityStatus === DebtFacilityCompanyStatusEnum.Waiver &&
          waiverDate === "") ||
        (selectedDebtFacilityStatus === DebtFacilityCompanyStatusEnum.Waiver &&
          waiverExpirationDate === "")
      }
      title={"Update Company Debt Facility Status"}
      contentWidth={800}
      primaryActionText={"Submit Status Change"}
      handleClose={handleClose}
      handlePrimaryAction={() => handleClick()}
    >
      <Box mt={4}>
        <Typography variant="body2" color="textSecondary">
          Selected Company
        </Typography>
        <Typography variant="body1">{selectedCompany.name}</Typography>
      </Box>
      <Box mt={4}>
        <Typography variant="body2" color="textSecondary">
          Current Debt Facility Status
        </Typography>
        <Typography variant="body1">
          {
            DebtFacilityCompanyStatusToLabel[
              selectedCompany.debt_facility_status as DebtFacilityCompanyStatusEnum
            ]
          }
        </Typography>
      </Box>
      <Box mt={4}>
        <FormControl className={classes.inputField}>
          <InputLabel id="select-debt-facility-status-label" required>
            New Debt Facility Status
          </InputLabel>
          <Select
            id="select-debt-facility-status"
            labelId="select-debt-facility-status-label"
            value={selectedDebtFacilityStatus}
            onChange={({ target: { value } }) =>
              setSelectedDebtFacilityStatus(
                value as DebtFacilityCompanyStatusEnum
              )
            }
          >
            {Object.values(DebtFacilityCompanyStatusEnum).map((status) => (
              <MenuItem key={status} value={status}>
                {
                  DebtFacilityCompanyStatusToLabel[
                    status as DebtFacilityCompanyStatusEnum
                  ]
                }
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {selectedDebtFacilityStatus === DebtFacilityCompanyStatusEnum.Waiver && (
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
                setWaiverExpirationDate(getDefaultExpirationDate(value) || "");
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
      <Box display="flex" flexDirection="column" mt={4}>
        <TextField
          id="status-change-comment-input"
          multiline
          label={"Status Change Comment"}
          //helperText={`[${(payment.bank_note || "").length}/${140}]`}
          value={statusComment}
          onChange={({ target: { value } }) => setStatusComment(value)}
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            This is a free text box to explain why the debt facility status is
            changing.
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
}

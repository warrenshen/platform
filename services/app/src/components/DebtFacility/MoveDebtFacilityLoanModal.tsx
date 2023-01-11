import {
  Box,
  TextField,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import AutocompleteDebtFacility from "components/DebtFacility/AutocompleteDebtFacility";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import Modal from "components/Shared/Modal/Modal";
import {
  GetDebtFacilitiesQuery,
  Loans,
  useGetDebtFacilityLoansByIdQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { moveLoansForDebtFacility } from "lib/api/debtFacility";
import { todayAsDateStringServer } from "lib/date";
import { ProductTypeEnum } from "lib/enum";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

type Facilities = GetDebtFacilitiesQuery["debt_facilities"];

interface Props {
  isMovingToFacility: boolean;
  selectedLoanIds?: Loans["id"][];
  facilities: Facilities;
  handleClose: () => void;
  supportedProductTypes: ProductTypeEnum[];
  defaultDebtFacilityId: string;
}

export default function MoveDebtFacilityLoanModal({
  isMovingToFacility,
  selectedLoanIds,
  facilities,
  handleClose,
  supportedProductTypes,
  defaultDebtFacilityId,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [debtFacilityId, setDebtFacilityId] = useState("");
  const [moveComments, setMoveComments] = useState("");
  const [debtFacilityAssignedDate, setDebtFacilityAssignedDate] = useState("");

  const { data, error } = useGetDebtFacilityLoansByIdQuery({
    skip: !selectedLoanIds,
    variables: {
      loan_ids: selectedLoanIds,
      target_date: todayAsDateStringServer(),
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }
  const companies = data?.companies || [];
  const companyInfoLookup = Object.assign(
    {},
    ...companies.map((company) => {
      return {
        [company.id]: (({ loans, ...c }) => c)(company),
      };
    })
  );

  const selectedLoans = companies.flatMap((company) => {
    return company.loans;
  });

  useEffect(() => {
    setDebtFacilityId(defaultDebtFacilityId);
  }, [defaultDebtFacilityId]);

  const productType = !!selectedLoans[0]?.company?.contract?.product_type
    ? selectedLoans[0].company.contract.product_type
    : "";

  const [moveLoans, { loading: isMoveLoansLoading }] = useCustomMutation(
    moveLoansForDebtFacility
  );

  // Submission Handler
  const handleClick = async () => {
    const loanIds = selectedLoans.map((loan) => loan.id);
    const response = await moveLoans({
      variables: {
        loanIds: loanIds,
        facilityId: debtFacilityId,
        isMovingToFacility: isMovingToFacility,
        moveComments: moveComments,
        moveDate: debtFacilityAssignedDate,
      },
    });

    if (response.status === "ERROR") {
      snackbar.showError(response.msg);
    } else {
      snackbar.showSuccess("Successfully moved loans");
      handleClose();
    }
  };

  return (
    <Modal
      dataCy={"move-debt-facility-loan-modal"}
      isPrimaryActionDisabled={isMoveLoansLoading}
      title={
        isMovingToFacility
          ? "Move Loan(s) From Bespoke Balance Sheet to Debt Facility"
          : "Move Loan(s) From Debt Facility to Bespoke Balance Sheet"
      }
      contentWidth={800}
      primaryActionText={"Submit Move Request"}
      handleClose={handleClose}
      handlePrimaryAction={() => handleClick()}
    >
      <Box display="flex" flexDirection="column">
        <TextField
          multiline
          label={"Move Notes"}
          placeholder={"Enter in any notes on this loan transfer"}
          value={moveComments}
          onChange={({ target: { value } }) => setMoveComments(value)}
        />
      </Box>
      {isMovingToFacility && (
        <Box mt={4}>
          <Box display="flex" flexDirection="column" width={400}>
            <Typography variant="body2" color="textSecondary">
              Target Debt Facility
            </Typography>
            <AutocompleteDebtFacility
              textFieldLabel="Select target debt facility"
              onChange={(selectedDebtFacility) => {
                setDebtFacilityId(selectedDebtFacility?.id || "");
              }}
              productType={productType}
              defaultDebtFacilityId={defaultDebtFacilityId}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <Typography variant="body2" color="textSecondary">
              If an assignment date is not set, it will default to today. This
              can be edited later.
            </Typography>
            <Box mt={2}>
              <DateInput
                disableNonBankDays
                className={classes.inputField}
                id="debt-facility-assignment-date-picker"
                label="Assignment Date"
                value={debtFacilityAssignedDate}
                onChange={(value) => setDebtFacilityAssignedDate(value || "")}
              />
            </Box>
          </Box>
          <Box mt={4}>
            <Typography variant="body2" color="textSecondary">
              The following loans will be moved from Bespoke's balance sheet to
              the selected debt facility.
            </Typography>
          </Box>
          <DebtFacilityLoansDataGrid
            loans={selectedLoans}
            companyInfoLookup={companyInfoLookup}
            isExcelExport={false}
            supportedProductTypes={supportedProductTypes}
          />
        </Box>
      )}
      {!isMovingToFacility && (
        <>
          <Box mt={4}>
            <Typography variant="body2" color="textSecondary">
              The following loans will be moved from the selected debt facility
              to Bespoke's balance sheet.
            </Typography>
          </Box>
          <DebtFacilityLoansDataGrid
            loans={selectedLoans}
            companyInfoLookup={companyInfoLookup}
            isExcelExport={false}
            supportedProductTypes={supportedProductTypes}
          />
        </>
      )}
    </Modal>
  );
}

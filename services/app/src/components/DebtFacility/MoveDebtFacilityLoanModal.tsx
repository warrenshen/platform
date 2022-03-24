import { Box, TextField, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Modal from "components/Shared/Modal/Modal";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import AutocompleteDebtFacility from "components/DebtFacility/AutocompleteDebtFacility";
import DebtFacilityLoansDataGrid from "components/DebtFacility/DebtFacilityLoansDataGrid";
import { moveLoansForDebtFacility } from "lib/api/debtFacility";
import { DebtFacilityStatusEnum, ProductTypeEnum } from "lib/enum";
import {
  GetDebtFacilitiesSubscription,
  OpenLoanForDebtFacilityFragment,
  useGetDebtFacilityCurrentCapacitySubscription,
  useGetOpenLoansByDebtFacilityIdSubscription,
} from "generated/graphql";
import { formatCurrency } from "lib/number";
import { useState } from "react";

type Facilities = GetDebtFacilitiesSubscription["debt_facilities"];

interface Props {
  isMovingToFacility: boolean;
  selectedLoans: OpenLoanForDebtFacilityFragment[];
  facilities: Facilities;
  handleClose: () => void;
  supportedProductTypes: ProductTypeEnum[];
}

export default function MoveDebtFacilityLoanModal({
  isMovingToFacility,
  selectedLoans,
  facilities,
  handleClose,
  supportedProductTypes,
}: Props) {
  const snackbar = useSnackbar();
  const [debtFacilityId, setDebtFacilityId] = useState("");
  const [moveComments, setMoveComments] = useState("");

  const productType = !!selectedLoans[0]?.company?.contract?.product_type
    ? selectedLoans[0].company.contract.product_type
    : "";

  // Calculate the total outstanding principal for the loans being requested to move
  // If we're moving *from* the debt facility to bespoke, we don't need to calculate this at the moment
  const totalPrincipalToMove = isMovingToFacility
    ? selectedLoans
        .map((loan) => {
          return loan?.outstanding_principal_balance || 0;
        })
        .reduce((a, b) => a + b, 0)
    : 0;

  // Calculate current total usage of selected debt facility, this will make sure we don't go over capacity
  // If we're moving *from* the debt facility to bespoke, we don't need to calculate this at the moment
  const {
    data: usageData,
    loading: usageLoading,
    error: usageError,
  } = useGetOpenLoansByDebtFacilityIdSubscription({
    skip: debtFacilityId === "" || isMovingToFacility === false,
    variables: {
      statuses: [DebtFacilityStatusEnum.SOLD_INTO_DEBT_FACILITY],
      target_facility_ids: [debtFacilityId],
    },
  });
  if (usageError) {
    console.error({ usageError });
    alert(`Error in query (details in console): ${usageError.message}`);
  }
  const usageLoans = usageData?.loans || [];
  const totalPrincipalAlreadyInUse =
    usageLoans.length > 0
      ? usageLoans
          .map((loan) => {
            return loan?.outstanding_principal_balance;
          })
          .reduce((a, b) => a + b, 0)
      : 0;

  // Retrieve max capacity for the selected debt facility, this will make sure we don't go over capacity
  // If we're moving *from* the debt facility to bespoke, we don't need to calculate this at the moment
  const {
    data: capacityData,
    loading: capacityLoading,
    error: capacityError,
  } = useGetDebtFacilityCurrentCapacitySubscription({
    skip: debtFacilityId === "" || isMovingToFacility === false,
    variables: {
      target_facility_id: debtFacilityId,
    },
  });
  if (capacityError) {
    console.error({ capacityError });
    alert(`Error in query (details in console): ${capacityError.message}`);
  }
  const maxCapacity =
    capacityData?.debt_facilities[0]?.debt_facility_capacities[0]?.amount ||
    0.0;

  const wouldMovePutFacilityOverCapacity =
    totalPrincipalToMove + totalPrincipalAlreadyInUse > maxCapacity;

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
      isPrimaryActionDisabled={
        isMoveLoansLoading ||
        usageLoading ||
        capacityLoading ||
        wouldMovePutFacilityOverCapacity
      }
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
      {isMovingToFacility &&
        !!debtFacilityId &&
        !!wouldMovePutFacilityOverCapacity && (
          <Box mt={4}>
            <Alert severity="info">
              <Typography variant="body1">
                Moving the request loans, with a total oustanding principal of{" "}
                {formatCurrency(totalPrincipalToMove)}
                would put the target debt facility over their capacity of{" "}
                {formatCurrency(maxCapacity)}. The facility is currently using{" "}
                {formatCurrency(totalPrincipalAlreadyInUse)}, please adjust
                accordingly.
              </Typography>
            </Alert>
          </Box>
        )}
      {isMovingToFacility && (
        <Box display="flex" flexDirection="column" width={400} mb={2}>
          <Typography variant="body2" color="textSecondary">
            Target Debt Facility
          </Typography>
          <AutocompleteDebtFacility
            textFieldLabel="Select target debt facility"
            onChange={(selectedDebtFacilityId) => {
              setDebtFacilityId(selectedDebtFacilityId);
            }}
            productType={productType}
          />
        </Box>
      )}
      {isMovingToFacility && (
        <>
          <Box mt={4}>
            <Typography variant="body2" color="textSecondary">
              The following loans will be moved from Bespoke's balance sheet to
              the selected debt facility.
            </Typography>
          </Box>
          <DebtFacilityLoansDataGrid
            loans={selectedLoans}
            isCompanyVisible
            isStatusVisible
            isMaturityVisible
            isDisbursementIdentifierVisible
            isSortingDisabled
            isExcelExport={false}
            supportedProductTypes={supportedProductTypes}
          />
        </>
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
            isCompanyVisible
            isStatusVisible
            isMaturityVisible
            isDisbursementIdentifierVisible
            isSortingDisabled
            isExcelExport={false}
            supportedProductTypes={supportedProductTypes}
          />
        </>
      )}
    </Modal>
  );
}

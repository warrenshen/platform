import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import GaugeProgressBar from "components/Shared/ProgressBar/GaugeProgressBar";
import {
  DebtFacilities,
  GetDebtFacilitiesSubscription,
  useGetOpenLoansByDebtFacilityIdSubscription,
} from "generated/graphql";
import { DebtFacilityStatusEnum, ProductTypeEnum } from "lib/enum";
import { formatCurrency } from "lib/number";
import { round } from "lodash";
import { useState } from "react";

type Facilities = GetDebtFacilitiesSubscription["debt_facilities"];

interface Props {
  facilities: Facilities;
  allFacilityIds: DebtFacilities["id"][];
  selectedDebtFacilityId: DebtFacilities["id"];
  setSelectedDebtFacilityId: (value: DebtFacilities["id"]) => void;
  setSelectedDebtFacilitySupportedProductTypes: (
    value: ProductTypeEnum[]
  ) => void;
}

function DebtFacilityCapacitySummary({
  facilities,
  allFacilityIds,
  selectedDebtFacilityId,
  setSelectedDebtFacilityId,
  setSelectedDebtFacilitySupportedProductTypes,
}: Props) {
  const [maximumCapacity, setMaximumCapacity] = useState(0);
  const [isDebtFacilitySelected, setIsDebtFacilitySelected] = useState(false);

  // Get total of loans currently in the debt facility
  const {
    data: debtFacilityData,
    error: debtFacilityError,
  } = useGetOpenLoansByDebtFacilityIdSubscription({
    variables: {
      statuses: [
        DebtFacilityStatusEnum.SOLD_INTO_DEBT_FACILITY,
        DebtFacilityStatusEnum.WAIVER,
      ],
      target_facility_ids: !!selectedDebtFacilityId
        ? [selectedDebtFacilityId]
        : allFacilityIds,
    },
  });
  if (debtFacilityError) {
    console.error({ debtFacilityError });
    alert(`Error in query (details in console): ${debtFacilityError.message}`);
  }
  const debtFacilityLoans = debtFacilityData?.loans || [];
  const currentUsage = debtFacilityLoans
    .map((loan) => {
      return loan.outstanding_principal_balance;
    })
    .reduce((a, b) => a + b, 0);

  const rawLimitPercent =
    !!maximumCapacity && maximumCapacity !== 0
      ? (100 * currentUsage) / maximumCapacity
      : 0;
  const roundedLimitPercent = round(rawLimitPercent, 1);

  return (
    <Box
      display="flex"
      flexDirection="row"
      height="50px"
      justifyContent="space-between"
    >
      <Box flex="2" flexDirection="row" alignItems="flext-start">
        {!!isDebtFacilitySelected && (
          <Typography variant="h5" color="textSecondary">
            {`${formatCurrency(currentUsage)} / ${formatCurrency(
              maximumCapacity
            )}`}
          </Typography>
        )}
      </Box>
      <Box flex="1" display="flex" flexDirection="row" alignItems="center">
        <FormControl>
          <Autocomplete
            autoHighlight
            id="auto-complete-debt-facility"
            options={facilities}
            getOptionLabel={(debtFacility) => {
              return `${debtFacility.name}`;
            }}
            style={{
              width: 300,
              paddingRight: "50px",
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={"Pick debt facility"}
                variant="outlined"
              />
            )}
            onChange={(_event, debtFacility) => {
              setSelectedDebtFacilityId(debtFacility?.id || "");
              const supportedProductTypes = (debtFacility?.product_types
                ? debtFacility?.product_types["supported"]
                : []) as ProductTypeEnum[];
              setSelectedDebtFacilitySupportedProductTypes(
                supportedProductTypes
              );
              setMaximumCapacity(
                debtFacility?.maximum_capacities[0]?.amount || 0
              );
              setIsDebtFacilitySelected(!!debtFacility || false);
            }}
          />
        </FormControl>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        style={{
          position: "relative",
          top: "-70px",
        }}
      >
        <Box width={200}>
          {!!isDebtFacilitySelected && (
            <GaugeProgressBar
              value={roundedLimitPercent}
              valueFontSize={20}
              caption={"Capacity Usage"}
              containerWidth={200}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default DebtFacilityCapacitySummary;

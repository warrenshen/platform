import {
  Box,
  List,
  ListItem,
  ListItemText,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import AutocompleteDebtFacility from "components/DebtFacility/AutocompleteDebtFacility";
import GaugeProgressBar from "components/Shared/ProgressBar/GaugeProgressBar";
import {
  DebtFacilities,
  GetDebtFacilitiesQuery,
  useGetOpenLoansByDebtFacilityIdSubscription,
} from "generated/graphql";
import { DebtFacilityStatusEnum, ProductTypeEnum } from "lib/enum";
import { formatCurrency } from "lib/number";
import { round } from "lodash";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listItem: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "row",
    },
    listItemText: {
      fontSize: "18px",
    },
    listItemTextSecondary: {
      textAlign: "right",
    },
  })
);

type Facilities = GetDebtFacilitiesQuery["debt_facilities"];

interface Props {
  facilities: Facilities;
  allFacilityIds: DebtFacilities["id"][];
  selectedDebtFacilityId: DebtFacilities["id"];
  setSelectedDebtFacilityId: (value: DebtFacilities["id"]) => void;
  setSelectedDebtFacilitySupportedProductTypes: (
    value: ProductTypeEnum[]
  ) => void;
  defaultDebtFacilityId: string;
}

function DebtFacilityCapacitySummary({
  facilities,
  allFacilityIds,
  selectedDebtFacilityId,
  setSelectedDebtFacilityId,
  setSelectedDebtFacilitySupportedProductTypes,
  defaultDebtFacilityId,
}: Props) {
  const classes = useStyles();

  const [drawnCapacity, setDrawnCapacity] = useState(0);
  const [maximumCapacity, setMaximumCapacity] = useState(0);
  const [isDebtFacilitySelected, setIsDebtFacilitySelected] = useState(false);

  // Get total of loans currently in the debt facility
  const { data: debtFacilityData, error: debtFacilityError } =
    useGetOpenLoansByDebtFacilityIdSubscription({
      variables: {
        statuses: [
          DebtFacilityStatusEnum.SoldIntoDebtFacility,
          DebtFacilityStatusEnum.Waiver,
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

  useEffect(() => {
    if (defaultDebtFacilityId !== "") {
      setIsDebtFacilitySelected(true);
      const defaultFacility = facilities.find(
        (facility) => facility.id === defaultDebtFacilityId
      );
      setMaximumCapacity(defaultFacility?.maximum_capacities[0]?.amount || 0.0);
      setDrawnCapacity(defaultFacility?.drawn_capacities[0]?.amount || 0.0);
      setSelectedDebtFacilityId(defaultFacility?.id || "");
      const supportedProductTypes = (
        defaultFacility?.product_types
          ? defaultFacility?.product_types["supported"]
          : []
      ) as ProductTypeEnum[];
      setSelectedDebtFacilitySupportedProductTypes(supportedProductTypes);
    }
  }, [
    defaultDebtFacilityId,
    facilities,
    setSelectedDebtFacilityId,
    setSelectedDebtFacilitySupportedProductTypes,
  ]);

  const summaries = [
    {
      primary: "Eligible:",
      secondary: formatCurrency(currentUsage),
    },
    {
      primary: "Drawn:",
      secondary: formatCurrency(drawnCapacity),
    },
    {
      primary: "Max:",
      secondary: formatCurrency(maximumCapacity),
    },
  ];

  return (
    <Box
      display="flex"
      flexDirection="row"
      height="50px"
      justifyContent="space-between"
    >
      <Box flex="2" display="flex" flexDirection="row" alignItems="flext-start">
        <AutocompleteDebtFacility
          textFieldLabel="Pick debt facility"
          onChange={(debtFacility) => {
            setSelectedDebtFacilityId(debtFacility?.id || "");
            const supportedProductTypes = (
              debtFacility?.product_types
                ? debtFacility?.product_types["supported"]
                : []
            ) as ProductTypeEnum[];
            setSelectedDebtFacilitySupportedProductTypes(supportedProductTypes);
            setMaximumCapacity(
              debtFacility?.maximum_capacities[0]?.amount || 0.0
            );
            setDrawnCapacity(debtFacility?.drawn_capacities[0]?.amount || 0.0);
            setIsDebtFacilitySelected(!!debtFacility || false);
          }}
          defaultDebtFacilityId={defaultDebtFacilityId}
        />
      </Box>
      <Box
        flex="1"
        flexDirection="row"
        alignItems="center"
        style={{
          position: "relative",
          top: "-80px",
        }}
      >
        {!!isDebtFacilitySelected && (
          <List dense>
            {summaries.map((summary, i) => (
              <ListItem className={classes.listItem}>
                <ListItemText
                  primaryTypographyProps={{
                    className: classes.listItemText,
                  }}
                  primary={summary.primary}
                />
                <ListItemText
                  secondaryTypographyProps={{
                    className: `${classes.listItemText} ${classes.listItemTextSecondary}`,
                  }}
                  secondary={summary.secondary}
                />
              </ListItem>
            ))}
          </List>
        )}
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

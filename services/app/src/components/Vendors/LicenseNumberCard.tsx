import {
  Box,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { ColumnWidths } from "lib/tables";

import { LicenseNumberOptionType } from "./AutocompleteLicenseNumbers";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      lineHeight: "18.66px",
      marginBottom: 6,
    },
    value: {
      lineHeight: "19.15px",
    },
  })
);

export default function LicenseNumberCard({
  legal_name,
  license_number,
  license_category,
  us_state,
}: LicenseNumberOptionType) {
  const classes = useStyles();
  return (
    <Box display="flex" m={1} width="100%">
      <Box display="flex" flexDirection="column" width="60%">
        <Box display="flex" flexDirection="column" mb={3}>
          <Typography
            variant="body1"
            color="textSecondary"
            className={classes.label}
          >
            License number
          </Typography>
          <Typography className={classes.value}>
            <strong>{license_number}</strong>
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Typography
            variant="body1"
            color="textSecondary"
            className={classes.label}
          >
            Company
          </Typography>
          <Typography className={classes.value}>
            <strong>{legal_name}</strong>
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <Box
          display="flex"
          flexDirection="column"
          width={ColumnWidths.MinWidth}
          mb={3}
        >
          <Typography
            variant="body1"
            color="textSecondary"
            className={classes.label}
          >
            License Type
          </Typography>
          <Typography className={classes.value}>
            <strong>{license_category}</strong>
          </Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          width={ColumnWidths.MinWidth}
        >
          <Typography
            variant="body1"
            color="textSecondary"
            className={classes.label}
          >
            US State
          </Typography>
          <Typography className={classes.value}>
            <strong>{us_state}</strong>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

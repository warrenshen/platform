import {
  Box,
  Card,
  CardActions,
  CardContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import EditButton from "components/Shared/CompanyProfile/EditCompanyProfile/EditButton";
import { CompanyFragment } from "generated/graphql";

const useStyles = makeStyles({
  card: {
    width: 400,
    minHeight: 100,
  },
  label: {
    width: 200,
    color: grey[600],
  },
});

interface Props {
  isEditAllowed?: boolean;
  company: CompanyFragment;
  handleDataChange: () => void;
}

export default function CompanyInfo({
  isEditAllowed = true,
  company,
  handleDataChange,
}: Props) {
  const classes = useStyles();
  return (
    <Box display="flex">
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6">{company?.name}</Typography>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Identifier</Box>
            <Box>{company?.identifier}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Contract Name</Box>
            <Box>{company?.contract_name}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Address</Box>
            <Box>{company?.address}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Phone number</Box>
            <Box>{company?.phone_number}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>DBA</Box>
            <Box>{company?.dba_name}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>EIN</Box>
            <Box>{company?.employer_identification_number}</Box>
          </Box>
        </CardContent>
        {isEditAllowed && (
          <CardActions>
            <EditButton company={company} handleDataChange={handleDataChange} />
          </CardActions>
        )}
      </Card>
    </Box>
  );
}

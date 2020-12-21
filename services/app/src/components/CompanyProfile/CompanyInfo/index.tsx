import {
  Box,
  Card,
  CardContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import EditButton from "components/CompanyProfile/EditCompanyProfile/EditButton";
import { CompanyFragment } from "generated/graphql";

const useStyles = makeStyles({
  baseInput: {
    width: 300,
  },
  label: {
    width: 130,
    color: grey[600],
  },
});

interface Params {
  company: CompanyFragment;
}

function CompanyInfo({ company }: Params) {
  const classes = useStyles();
  return (
    <Box display="flex">
      <Card>
        <CardContent>
          <Typography variant="h6">{company?.name}</Typography>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Address</Box>
            <Box>{company?.address}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Phone number</Box>
            <Box>{company?.phone_number}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Email</Box>
            <Box>{company?.contact_email_address}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>DBA</Box>
            <Box>{company?.dba_name}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>EIN</Box>
            <Box>{company?.employer_identification_number}</Box>
          </Box>
          <EditButton company={company}></EditButton>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CompanyInfo;

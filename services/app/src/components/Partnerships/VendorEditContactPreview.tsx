import {
  Box,
  Container,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import { EditContactPreviewInformation } from "components/Partnerships/HandleVendorChangeRequestModal";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(2),
      backgroundColor: "#fafafa",
      borderRadius: 3,
    },
    loanBeforeAfterPayment: {
      display: "flex",
      alignItems: "center",

      width: "100%",
      marginTop: theme.spacing(2),
    },
    middle: {
      display: "flex",
      justifyContent: "center",
      width: 40,
    },
    loanBeforePayment: {
      display: "flex",
      justifyContent: "flex-end",

      flex: 6,
    },
    loanAfterPayment: {
      flex: 4,
    },
    information: {
      boxSizing: "border-box",

      background: "#FFFFFF",

      borderBottom: "1px solid #E6E4E1",
      borderRadius: "0px",

      paddingTop: "19px",
      paddingRight: "24px",
      paddingBottom: "18px",
      paddingLeft: "24px",

      // fontFamily: 'Inter',
      fontStyle: "normal",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "133.3%",
    },
    afterColor: {
      background: "#F6F5F3",
    },
    label: {
      color: "#605F5C",
      fontWeight: 700,
      fontSize: "14px",
      lineHeight: "136.8%",
      paddingRight: "12px",
    },
    arrow: {
      padding: "139px 18px",
    },
  })
);

interface Props {
  previewData: EditContactPreviewInformation;
}

export default function VendorEditContactPreview({ previewData }: Props) {
  const classes = useStyles();

  return (
    <Container>
      <Box display="flex" flexDirection="row">
        <Box width={"20%"}>
          <Typography variant="h6">&nbsp; </Typography>
          <Box className={`${classes.information} ${classes.label}`}>
            <Typography variant="subtitle2">First Name</Typography>
          </Box>
          <Box className={`${classes.information} ${classes.label}`}>
            <Typography variant="subtitle2">Last Name</Typography>
          </Box>
          <Box className={`${classes.information} ${classes.label}`}>
            <Typography variant="subtitle2">Email</Typography>
          </Box>
          <Box className={`${classes.information} ${classes.label}`}>
            <Typography variant="subtitle2">Phone Number</Typography>
          </Box>
        </Box>
        <Box width={"10%"} className={classes.arrow}></Box>
        <Box width={"30%"}>
          <Typography variant="h6" align="center">
            Before
          </Typography>
          <Box className={classes.information}>
            <Typography variant="subtitle2">
              {previewData.previousFirstName}
            </Typography>
          </Box>
          <Box className={classes.information}>
            <Typography variant="subtitle2">
              {previewData.previousLastName}
            </Typography>
          </Box>
          <Box className={classes.information}>
            <Typography variant="subtitle2" noWrap>
              {previewData.previousEmail}
            </Typography>
          </Box>
          <Box className={classes.information}>
            <Typography variant="subtitle2">
              {previewData.previousPhoneNumber}
            </Typography>
          </Box>
        </Box>
        <Box width={"10%"} className={classes.arrow}>
          <ArrowRightAlt />
        </Box>
        <Box width={"30%"}>
          <Typography variant="h6" align="center">
            After
          </Typography>
          <Box className={`${classes.information} ${classes.afterColor}`}>
            <Typography variant="subtitle2">
              {previewData.newFirstName}
            </Typography>
          </Box>
          <Box className={`${classes.information} ${classes.afterColor}`}>
            <Typography variant="subtitle2">
              {previewData.newLastName}
            </Typography>
          </Box>
          <Box className={`${classes.information} ${classes.afterColor}`}>
            <Typography variant="subtitle2" noWrap>
              {previewData.newEmail}
            </Typography>
          </Box>
          <Box className={`${classes.information} ${classes.afterColor}`}>
            <Typography variant="subtitle2">
              {previewData.newPhoneNumber}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import {
  CustomerSurveillanceResults,
  useGetSurveillanceResultByIdQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteCustomerSurveillanceResultMutation } from "lib/api/customerSurveillance";
import { formatDateString } from "lib/date";
import {
  ProductTypeEnum,
  ProductTypeToLabel,
  SurveillanceStatusEnum,
  SurveillanceStatusToLabel,
} from "lib/enum";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: "500px",
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: 400,
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  surveillanceResultId: CustomerSurveillanceResults["id"];
  handleClose: () => void;
}

export default function DeleteSurveillanceResultModal({
  surveillanceResultId,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const {
    data,
    loading: isSurveillanceResultLoading,
    error,
  } = useGetSurveillanceResultByIdQuery({
    fetchPolicy: "network-only",
    variables: {
      surveillance_result_id: surveillanceResultId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const surveillanceResult = data?.surveillance_result || null;
  const submittingUserName = !!surveillanceResult?.submitting_user
    ? `${surveillanceResult.submitting_user.first_name} ${surveillanceResult.submitting_user.last_name}`
    : "";

  const [
    deleteSurveillanceResult,
    { loading: isdeleteCustomerSurveillanceResultLoading },
  ] = useCustomMutation(deleteCustomerSurveillanceResultMutation);

  const handleClickDelete = async () => {
    const response = await deleteSurveillanceResult({
      variables: {
        surveillance_result_id: surveillanceResultId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError("Could not not delete surveillance result.");
    } else {
      snackbar.showSuccess("Surveillance result deleted.");
      handleClose();
    }
  };

  const isDeleteDisabled =
    isdeleteCustomerSurveillanceResultLoading || isSurveillanceResultLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Delete Surveillance Result
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column">
            <Box mt={2}>
              <Typography variant="body1">
                {`Qualifying Date: ${
                  !!surveillanceResult?.qualifying_date
                    ? formatDateString(surveillanceResult.qualifying_date)
                    : ""
                }`}
              </Typography>
            </Box>
            <Box mt={1}>
              <Typography variant="body1">
                {`Qualifying Product: ${
                  !!surveillanceResult?.qualifying_product
                    ? ProductTypeToLabel[
                        surveillanceResult.qualifying_product as ProductTypeEnum
                      ]
                    : ""
                }`}
              </Typography>
            </Box>
            <Box mt={1}>
              <Typography variant="body1">
                {`Surveillance Status: ${
                  !!surveillanceResult?.surveillance_status
                    ? SurveillanceStatusToLabel[
                        surveillanceResult.surveillance_status as SurveillanceStatusEnum
                      ]
                    : ""
                }`}
              </Typography>
            </Box>
            <Box mt={1}>
              <Typography variant="body1">
                {`Bank Note: ${surveillanceResult?.bank_note || ""}`}
              </Typography>
            </Box>
            <Box mt={1}>
              <Typography variant="body1">
                {`Surveilled By: ${submittingUserName}`}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={isDeleteDisabled}
            onClick={handleClickDelete}
            variant="contained"
            color="primary"
          >
            Delete
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

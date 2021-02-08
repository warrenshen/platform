import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
} from "@material-ui/core";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  EbbaApplicationFilesInsertInput,
  EbbaApplicationsInsertInput,
  useAddEbbaApplicationMutation,
} from "generated/graphql";
import { useContext, useState } from "react";
import EbbaApplicationForm from "./EbbaApplicationForm";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogTitle: {
      paddingLeft: theme.spacing(3),
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: "200px",
    },
    dialogActions: {
      margin: theme.spacing(4),
      marginTop: 0,
      marginBottom: 15,
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  handleClose: () => void;
}

function CreateEbbaApplicationModal({ handleClose }: Props) {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  // Default EbbaApplication for CREATE case.
  const newEbbaApplication = {
    application_month: "2021-02-01",
    monthly_accounts_receivable: "",
    monthly_inventory: "",
    monthly_cash: "",
  } as EbbaApplicationsInsertInput;

  const [ebbaApplication, setEbbaApplication] = useState(newEbbaApplication);

  const [ebbaApplicationFiles, setEbbaApplicationFiles] = useState<
    EbbaApplicationFilesInsertInput[]
  >([]);

  const [
    addEbbaApplication,
    { loading: isAddEbbaApplicationLoading },
  ] = useAddEbbaApplicationMutation();

  const isFormLoading = isAddEbbaApplicationLoading;
  const isSubmitDisabled =
    isFormLoading ||
    !ebbaApplication.monthly_accounts_receivable ||
    !ebbaApplication.monthly_inventory ||
    !ebbaApplication.monthly_cash;

  const handleClickSubmit = async () => {
    const response = await addEbbaApplication({
      variables: {
        ebbaApplication: {
          application_month: ebbaApplication.application_month,
          monthly_accounts_receivable:
            ebbaApplication.monthly_accounts_receivable,
          monthly_inventory: ebbaApplication.monthly_inventory,
          monthly_cash: ebbaApplication.monthly_cash,
          ebba_application_files: {
            data: ebbaApplicationFiles,
          },
        },
      },
    });
    const savedEbbaApplication = response.data?.insert_ebba_applications_one;
    if (!savedEbbaApplication) {
      alert("Could not create EBBA application");
    } else {
      handleClose();
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Submit Eligible Borrower Base Amount Application
      </DialogTitle>
      <DialogContent>
        <EbbaApplicationForm
          companyId={companyId}
          ebbaApplication={ebbaApplication}
          ebbaApplicationFiles={ebbaApplicationFiles}
          setEbbaApplication={setEbbaApplication}
          setEbbaApplicationFiles={setEbbaApplicationFiles}
        ></EbbaApplicationForm>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          className={classes.submitButton}
          disabled={isSubmitDisabled}
          onClick={handleClickSubmit}
          variant={"contained"}
          color={"primary"}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateEbbaApplicationModal;

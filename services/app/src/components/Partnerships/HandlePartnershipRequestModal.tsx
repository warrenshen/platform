import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Companies, CompanyMinimalFragment } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { createPartnershipMutation } from "lib/api/companies";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
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
  partnerRequest: any;
  allCompanies: CompanyMinimalFragment[];
  handleClose: () => void;
}

export default function HandlePartnershipRequestModal({
  partnerRequest,
  allCompanies,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const isSubmitDisabled = false;
  const [selectedCompanyId, setSelectedCompanyId] = useState<Companies["id"]>(
    null
  );

  const handleSubmit = async () => {
    const response = await createPartnershipMutation({
      variables: {
        partnership_request_id: partnerRequest.id,
        should_create_company: selectedCompanyId === null,
        partner_company_id: selectedCompanyId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(
        `Error! Could not create partnership. Reason: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(
        "Partnership created and email sent to the customer and partner"
      );
      handleClose();
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="lg"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        Create Partnership
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please confirm the partnership request. If the partner is an existing
          company, please use the dropdown, otherwise a new company will be
          created.
        </DialogContentText>
        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle2" color="textSecondary">
            Requesting Company
          </Typography>
          <Typography variant={"body1"}>
            {partnerRequest.requesting_company.name}
          </Typography>
        </Box>
        <Box mb={2} mt={2}>
          <Divider />
        </Box>
        <Box display="flex" flexDirection="column" mb={1}>
          <Typography variant="subtitle2" color="textSecondary">
            New Partner Type
          </Typography>
          <Typography variant={"body1"}>
            {partnerRequest.company_type}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mb={1}>
          <Typography variant="subtitle2" color="textSecondary">
            New Partner Name
          </Typography>
          <Typography variant={"body1"}>
            {partnerRequest.company_name}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle2" color="textSecondary">
            New Partner License IDs
          </Typography>
          <Typography variant={"body1"}>
            {partnerRequest.license_info
              ? partnerRequest.license_info.license_ids.join(", ")
              : ""}
          </Typography>
        </Box>
        <Box mb={2} mt={2}>
          <Divider />
        </Box>
        <Box display="flex" flexDirection="column">
          <Typography variant={"body1"}>
            Choose a pre-existing company if the company already exists on the
            platform
          </Typography>
          <Box mt={2}>
            <Autocomplete
              autoHighlight
              id="auto-complete-company"
              options={allCompanies}
              getOptionLabel={(company) => company.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select partner company"
                  variant="outlined"
                />
              )}
              onChange={(_event, company) =>
                setSelectedCompanyId(company?.id || null)
              }
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button variant={"contained"} color={"default"} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          disabled={isSubmitDisabled}
          variant={"contained"}
          color={"primary"}
          onClick={handleSubmit}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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
  CompanySettings,
  Users,
  useGetActiveTeamMembersQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { upsertDealOwnerMutation } from "lib/api/settings";
import { ChangeEvent, useState } from "react";

import AutocompleteUsers from "./AutocompleteUsers";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
  })
);

interface Props {
  companySettingsId: CompanySettings["id"];
  underwriterUserId: Users["id"];
  businessDevelopmentUserId: Users["id"];
  clientSuccessUserId: Users["id"];
  handleClose: () => void;
}

export default function UpsertDealOwnersModal({
  companySettingsId,
  underwriterUserId,
  businessDevelopmentUserId,
  clientSuccessUserId,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();
  const { data, error } = useGetActiveTeamMembersQuery();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const clientSuccessTeamMembers = data?.client_success_team_members;
  const businessDevelopmentTeamMembers =
    data?.business_development_team_members;
  const underwritingTeamMembers = data?.underwriting_team_members;

  const [underwriterTeamMemberId, setUnderwriterTeamMemberId] =
    useState(underwriterUserId);
  const [businessDevelopmentTeamMemberId, setBusinessDevelopmentTeamMemberId] =
    useState(businessDevelopmentUserId);
  const [clientSuccessTeamMemberId, setClientSuccessTeamMemberId] =
    useState(clientSuccessUserId);
  const [upsertDealOwner] = useCustomMutation(upsertDealOwnerMutation);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClickSubmit = async () => {
    console.log(underwriterTeamMemberId);
    const response = await upsertDealOwner({
      variables: {
        company_settings_id: companySettingsId,
        client_success_user_id: clientSuccessTeamMemberId,
        business_development_user_id: businessDevelopmentTeamMemberId,
        underwriter_user_id: underwriterTeamMemberId,
      },
    });

    if (response.status !== "OK") {
      setErrorMessage(response.msg);
      snackbar.showError(
        `Could not update deal owners. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Deal owners updated successfully");
      handleClose();
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Edit Deal Owners</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          {!!errorMessage && (
            <Typography color="error" gutterBottom={true}>
              {errorMessage}
            </Typography>
          )}
        </Box>
        <AutocompleteUsers
          textFieldLabel="Underwriting Team Member"
          selectedUserId={underwriterTeamMemberId}
          users={underwritingTeamMembers}
          onChange={(event: ChangeEvent<{}>, user: Users) => {
            console.log("USER:", user);
            setUnderwriterTeamMemberId(user?.id || null);
          }}
        />
        <AutocompleteUsers
          textFieldLabel="Business Development Team Member"
          selectedUserId={businessDevelopmentTeamMemberId}
          users={businessDevelopmentTeamMembers}
          onChange={(event: ChangeEvent<{}>, user: Users) => {
            setBusinessDevelopmentTeamMemberId(user?.id || null);
          }}
        />
        <AutocompleteUsers
          textFieldLabel="Customer Success Team Member"
          selectedUserId={clientSuccessTeamMemberId}
          users={clientSuccessTeamMembers}
          onChange={(event: ChangeEvent<{}>, user: Users) => {
            setClientSuccessTeamMemberId(user?.id || null);
          }}
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box display="flex">
          <Box mr={2}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClickSubmit}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

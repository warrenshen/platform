import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import { CompanySettings } from "generated/graphql";
import { getCustomMessageName } from "lib/companies";
import { CustomMessageEnum, AllCustomMessages } from "lib/enum";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { upsertCustomMessagesMutation } from "lib/api/companies";
import { useState } from "react";

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
  customMessagesPayload: { [key in CustomMessageEnum]: string | null };
  handleClose: () => void;
}

export default function UpsertCustomMessagesModal({
  companySettingsId,
  customMessagesPayload,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();

  const [customMessagesJson, setCustomMessagesJson] = useState(
    customMessagesPayload
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [
    upsertCustomMessages,
    { loading: isUpsertCustomMessagesLoading },
  ] = useCustomMutation(upsertCustomMessagesMutation);

  const handleClickSubmit = async () => {
    const response = await upsertCustomMessages({
      variables: {
        company_settings_id: companySettingsId,
        custom_messages_payload: customMessagesJson,
      },
    });
    if (response.status !== "OK") {
      setErrorMessage(response.msg);
      snackbar.showError(
        `Could not save custom messages. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Custom messages updated successfully");
      handleClose();
    }
  };

  const isSubmitDisabled = !customMessagesJson || isUpsertCustomMessagesLoading;

  return (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="md"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle>Edit Custom Messages</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          {!!errorMessage && (
            <Typography color="error" gutterBottom={true}>
              {errorMessage}
            </Typography>
          )}
        </Box>
        <Box display="flex" flexDirection="column">
          {AllCustomMessages.map((customMessage) => (
            <Box key={customMessage} mt={4}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  {getCustomMessageName(customMessage)}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" pl={2} mt={2}>
                <TextField
                  multiline
                  label={"Message"}
                  value={customMessagesJson[customMessage] || ""}
                  onChange={({ target: { value } }) =>
                    setCustomMessagesJson({
                      ...customMessagesJson,
                      [customMessage]: value,
                    })
                  }
                />
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box display="flex">
          <Box mr={2}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
          <Button
            disabled={isSubmitDisabled}
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

import {
  Card,
  CardActions,
  CardContent,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import ModalButton from "components/Shared/Modal/ModalButton";
import CreateUpdateThirdPartyUserModal from "components/Users/CreateUpdateThirdPartyUserModal";
import { Companies, ContactFragment } from "generated/graphql";
import { ActionType } from "lib/enum";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      width: 240,
    },
    nameInput: {
      width: 200,
    },
  })
);

interface Props {
  isEditAllowed?: boolean;
  isPayor: boolean;
  companyId: Companies["id"];
  contact: ContactFragment;
  handleDataChange: () => void;
}

function ContactCard({
  isEditAllowed = true,
  isPayor,
  companyId,
  contact,
  handleDataChange,
}: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="subtitle1">{contact?.full_name}</Typography>
        <Typography variant="subtitle1">{contact?.email}</Typography>
        <Typography variant="subtitle1">{contact?.phone_number}</Typography>
      </CardContent>
      {isEditAllowed && (
        <CardActions>
          <ModalButton
            label={"Edit"}
            color="default"
            size="small"
            variant="outlined"
            modal={({ handleClose }) => (
              <CreateUpdateThirdPartyUserModal
                actionType={ActionType.Update}
                isPayor={isPayor}
                companyId={companyId}
                userId={contact.id}
                handleClose={() => {
                  handleDataChange();
                  handleClose();
                }}
              />
            )}
          />
        </CardActions>
      )}
    </Card>
  );
}

export default ContactCard;

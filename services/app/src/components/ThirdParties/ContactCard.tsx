import {
  Button,
  Card,
  CardActions,
  CardContent,
  createStyles,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import {
  Companies,
  ContactFragment,
  useAddVendorContactMutation,
  UsersInsertInput,
  useUpdateVendorContactMutation,
} from "generated/graphql";
import { useEffect, useState } from "react";

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

export enum CardState {
  Viewing = "viewing",
  Editing = "editing",
  Creating = "creating",
}

interface Props {
  contact?: ContactFragment;
  isCreating?: boolean;
  onCreateComplete?: () => void;
  companyId?: Companies["id"];
  isEditAllowed?: boolean;
}

export default function ContactCard({
  isEditAllowed = true,
  contact: givenContact,
  isCreating,
  onCreateComplete,
  companyId,
}: Props) {
  const classes = useStyles();

  const [contact, setContact] = useState<UsersInsertInput>(
    givenContact || { company_id: companyId }
  );

  const [cardState, setCardState] = useState<CardState>(
    isCreating ? CardState.Creating : CardState.Viewing
  );

  const [updateContact] = useUpdateVendorContactMutation();

  const [addContact] = useAddVendorContactMutation();

  useEffect(() => {
    setContact(givenContact || { company_id: companyId });
  }, [companyId, givenContact]);

  return (
    <Card className={classes.card}>
      <CardContent>
        {cardState !== CardState.Viewing ? (
          <>
            <TextField
              label="First Name"
              required
              className={classes.nameInput}
              value={contact.first_name}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, first_name: value });
              }}
            />
            <TextField
              label="Last Name"
              required
              className={classes.nameInput}
              value={contact.last_name}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, last_name: value });
              }}
            />
            <TextField
              label="Email"
              required
              className={classes.nameInput}
              value={contact.email}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, email: value });
              }}
            />
            <TextField
              label="Phone Number"
              className={classes.nameInput}
              value={contact.phone_number}
              onChange={({ target: { value } }) => {
                setContact({ ...contact, phone_number: value });
              }}
            />
          </>
        ) : (
          <>
            <Typography variant="subtitle1">
              {givenContact?.full_name}
            </Typography>
            <Typography variant="subtitle1">{givenContact?.email}</Typography>
            <Typography variant="subtitle1">
              {givenContact?.phone_number}
            </Typography>
          </>
        )}
      </CardContent>

      {isEditAllowed && (
        <CardActions>
          {cardState === CardState.Viewing ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCardState(CardState.Editing)}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setCardState(CardState.Viewing);
                  onCreateComplete && onCreateComplete();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={
                  !contact.first_name || !contact.last_name || !contact.email
                }
                variant="contained"
                size="small"
                color="primary"
                onClick={async () => {
                  if (cardState === CardState.Editing) {
                    await updateContact({
                      variables: {
                        userId: contact.id,
                        contact: {
                          first_name: contact.first_name,
                          last_name: contact.last_name,
                          email: contact.email,
                          phone_number: contact.phone_number,
                        },
                      },
                    });
                  } else if (cardState === CardState.Creating) {
                    addContact({
                      variables: {
                        contact,
                      },
                    });
                  }
                  setCardState(CardState.Editing);
                  onCreateComplete && onCreateComplete();
                }}
              >
                Submit
              </Button>
            </>
          )}
        </CardActions>
      )}
    </Card>
  );
}
